import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards, NotFoundException } from '@nestjs/common';
import { AccessTokenGuard } from 'libs/auth/guards/jwt.guard';
import { CurrentUser } from 'libs/auth/decorators/currentUser.decorator';
import { JwtPayload } from 'libs/auth/types';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { render } from '@react-email/components';
import { Prisma } from '@prisma/client';

import { UserBookService } from './user-book.service';
import { BookService } from 'libs/book/book.service';
import { PrismaRepository } from 'prisma/prisma.repository';

import {
  BookWhereUniqueInput,
  READING_STATUS,
  UserBook,
  UserBookOrderByWithRelationInput,
  UserBookWhereInput,
  UserBookWhereUniqueInput,
} from '../../src/generated-db-types';
import { UserBookUpdateInput } from './models/user-book-update.input';
import { UserBookUpdateOrderInput } from './models/user-book-update-order.input';
import { UserBooksResponse } from './models/user-books.response';
import { BookCountsResponse } from './models/book-counts.response';
import { BookDataInput } from 'libs/book/dto/book-data.input';

import ImportSummaryEmail from '../../email/import-result';
import {
  buildBook,
  generateSlug,
  getUserBookInfo,
  parseLineWithQuotes,
  processCSVLine,
} from './utils';
import { getGoodreadsCover } from 'libs/book/api/book-cover.api';
import { GoodreadsBookData } from './types';

@Resolver(() => UserBook)
export class UserBookResolver {
  private readonly resend: Resend;
  private readonly domain: string;

  constructor(
    private readonly userBookService: UserBookService,
    private readonly bookService: BookService,
    private readonly prisma: PrismaRepository,
    private configService: ConfigService,
  ) {
    this.resend = new Resend(this.configService.get<string>('resend.api'));
    // this.resend = new Resend(appConfig.resendApiKey);
    this.domain = this.configService.get<string>('web.url');
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => UserBook, { name: 'addBookToShelf' })
  async addBookToShelf(
    @Args('where') where: UserBookWhereUniqueInput,
    @Args('shelf', { type: () => String }) shelf: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.userBookService.addBookToShelf(where.id, user.userId, shelf);
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => Boolean, { name: 'removeBookFromShelf' })
  async removeUserBookFromShelf(
    @Args('where') where: UserBookWhereUniqueInput,
    @Args('shelf', { type: () => String }) shelf: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.userBookService.removeBookFromShelf(
      where.id,
      user.userId,
      shelf,
    );
    return true;
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => UserBook)
  async createUserBook(
    @Args('data') data: BookDataInput,
    @CurrentUser() user: JwtPayload,
  ) {
    const newBook = await this.bookService.createBook(data);
    const createUserBookArgs: Prisma.UserBookCreateArgs = {
      data: {
        book: { connect: { id: newBook.id } },
        user: { connect: { id: user.userId } },
        status: READING_STATUS.WANT_TO_READ,
        dateAdded: new Date(),
      },
      include: { book: { select: { id: true, title: true } } },
    };
    return this.prisma.userBook.create(createUserBookArgs);
  }

  @UseGuards(AccessTokenGuard)
  @Query(() => UserBook, { nullable: true, name: 'userBook' })
  async userBook(
    @Args('where') where: BookWhereUniqueInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.userBookService.findUnique({
      where: { identifier: { userId: user.userId, bookId: where.id } },
    });
  }

  @UseGuards(AccessTokenGuard)
  @Query(() => UserBooksResponse)
  getUserBooks(
    @Args('where', { nullable: true }) where: UserBookWhereInput,
    @Args({ defaultValue: 0, name: 'offset', type: () => Int }) offset = 0,
    @Args({ defaultValue: 20, name: 'limit', type: () => Int }) limit = 20,
    @Args('orderBy', { nullable: true })
    orderBy: UserBookOrderByWithRelationInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.userBookService.findMany({
      where,
      userId: user.userId,
      skip: offset,
      take: limit,
      orderBy,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Query(() => Int)
  countUserBooks(
    @Args('where', { nullable: true }) where: UserBookWhereInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.userBookService.count({ where, userId: user.userId });
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => UserBook)
  async updateUserBook(
    @Args('data') data: UserBookUpdateInput,
    @Args('where') where: UserBookWhereUniqueInput,
    @CurrentUser() user: JwtPayload,
  ) {
    const userBook = await this.userBookService.findUnique({
      where: { id: where.id },
    });
    if (!userBook) {
      throw new NotFoundException(
        `User book ${JSON.stringify(where.id)} does not exist`,
      );
    }
    return this.userBookService.update({
      data,
      where: { id: where.id },
      userId: user.userId,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => [UserBook])
  updateUserBookOrder(
    @Args('data') data: UserBookUpdateOrderInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.userBookService.updateOrder(data.items, user.userId);
  }
  @UseGuards(AccessTokenGuard)
  @Mutation(() => Boolean)
  async importUserBooks(
    @Args('content') content: string,
    @CurrentUser() user: JwtPayload,
    @Args('shelves', { nullable: true, type: () => [String] })
    shelves?: string[],
    @Args('ownedShelf', { nullable: true }) ownedShelf?: string,
    @Args('favoritesShelf', { nullable: true }) favoritesShelf?: string,
  ) {
    const lines = content.split('\n'); // -1 for empty last line, -1 for the top row
    const mappings = parseLineWithQuotes(lines[0]);
    const failedBooks = [];
    const totalBooks = lines.length - 2;
    console.log(totalBooks);
    async function limitConcurrency(tasks, concurrencyLimit) {
      const results = [];
      let currentIndex = 0;

      async function nextBatch() {
        const batchTasks = tasks.slice(
          currentIndex,
          currentIndex + concurrencyLimit,
        );
        currentIndex += concurrencyLimit;
        await Promise.all(batchTasks.map((task) => task()));
        results.push(...(await Promise.all(batchTasks)));
      }

      while (currentIndex < tasks.length) {
        await nextBatch();
      }

      return results;
    }
    const filteredShelves = shelves.filter(
      (shelf) => shelf !== ownedShelf && shelf !== favoritesShelf,
    );
    // Create shelves using Prisma's createMany
    await this.prisma.shelf.createMany({
      data: Array.from(filteredShelves).map((shelf: string) => ({
        userId: user.userId,
        name: shelf,
        slug: generateSlug(shelf),
      })),
      skipDuplicates: true, // This option skips inserting duplicates if any
    });

    const importTasks = lines.slice(1, -1).map((line) => async () => {
      const goodreadsBook = processCSVLine(line, mappings);
      const book: GoodreadsBookData = buildBook(goodreadsBook);
      const imageLinks = await getGoodreadsCover(goodreadsBook['Book Id']);
      // on the client get all the covers,  then send list of covers to the server to add in one go
      const userInfo = getUserBookInfo(
        goodreadsBook,
        ownedShelf,
        favoritesShelf,
      );
      await this.userBookService.createImportedBook(
        userInfo,
        book,
        imageLinks,
        user,
      );
      console.log('Imported book', goodreadsBook['Title']);
    });

    const startTime = performance.now(); // Start measuring time
    await limitConcurrency(importTasks, 30);
    const endTime = performance.now(); // End measuring time
    const duration = endTime - startTime; // Calculate the duration in milliseconds

    console.log(`Import process took ${duration} milliseconds`);

    // if successful send email
    // await this.resend.emails.send({
    //   from: 'bookshelf@vivianlin.dev',
    //   to: user.email,
    //   subject: 'Confirm your email',
    //   html: render(
    //     ImportSummaryEmail({
    //       totalBooks: totalBooks.toString(),
    //       successBooks: (totalBooks - failedBooks.length).toString(),
    //       failedBooks: failedBooks.length.toString(), // Replace with the actual number of failed imports
    //       summaryLink: 'https://example.com/import-summary', // Replace with the actual link to the import summary
    //       username: user.username, // Replace with the actual username
    //       importId: 'import_123456', // Replace with the actual import ID
    //     }),
    //   ),
    // });

    return true;
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => Boolean)
  async removeUserBook(
    @Args('where') where: UserBookWhereUniqueInput,
    @CurrentUser() user: JwtPayload,
  ) {
    const userBook = await this.userBookService.findUnique({
      where: { id: where.id },
    });
    if (!userBook) {
      throw new NotFoundException(
        `User book ${JSON.stringify(where)} does not exist`,
      );
    }
    if (userBook.userId !== user.userId) {
      throw new NotFoundException(
        `Unauthorized to delete user book ${JSON.stringify(where)}`,
      );
    }
    await this.bookService.delete({ where: { id: userBook.bookId } });
    return true;
  }

  @Query(() => BookCountsResponse)
  async bookCountsByUserId(
    @Args('userId', { type: () => String }) userId: string,
  ) {
    const countByStatus = async (status: READING_STATUS) =>
      this.userBookService.count({ where: { status }, userId });

    const [wantsToReadCount, readingCount, finishedCount, upNextCount] =
      await Promise.all([
        countByStatus(READING_STATUS.WANT_TO_READ),
        countByStatus(READING_STATUS.READING),
        countByStatus(READING_STATUS.FINISHED),
        countByStatus(READING_STATUS.UP_NEXT),
      ]);

    return { wantsToReadCount, readingCount, finishedCount, upNextCount };
  }
}
