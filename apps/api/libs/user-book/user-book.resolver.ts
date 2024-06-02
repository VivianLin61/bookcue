import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UserBookService } from './user-book.service';
import {
  BookCreateInput,
  BookWhereUniqueInput,
  CoverCreateInput,
  CreateOneIdentifierArgs,
  IdentifierCreateInput,
  SOURCE,
  UserBook,
  UserBookOrderByWithRelationInput,
  UserBookWhereInput,
} from '../../src/generated-db-types';
import { AccessTokenGuard } from 'libs/auth/guards/jwt.guard';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'libs/auth/decorators/currentUser.decorator';
import { JwtPayload } from 'libs/auth/types';
import { UserBookUpdateInput } from './models/user-book-update.input';
import {
  buildBook,
  generateSlug,
  getUserBookInfo,
  parseLineWithQuotes,
  processCSVLine,
} from './utils';
import { BookService } from 'libs/book/book.service';
import { UserBookUpdateOrderInput } from './models/user-book-update-order.input';
import { UserBooksResponse } from './models/user-books.response';
import { PrismaRepository } from 'prisma/prisma.repository';
import { CoverService } from 'libs/cover/cover.service';
import { render } from '@react-email/components';
import ImportSummaryEmail from '../../email/import-result';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { getCovers } from 'libs/book/api/book-cover.api';
import { IdentifierService } from 'libs/identifier/identifier.service';

@Resolver(() => UserBook)
export class UserBookResolver {
  private readonly resend = new Resend(
    this.configService.get<string>('resend.api'),
  );
  private readonly domain = this.configService.get<string>('web.url');

  constructor(
    private readonly userBookService: UserBookService,
    private readonly bookService: BookService,
    private readonly coverService: CoverService,
    private configService: ConfigService,
    private readonly identifiersService: IdentifierService,
  ) {}

  containsNonNumeric(str: string) {
    return /\D/.test(str);
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => UserBook, { name: 'addBookToShelf' })
  async addBookToShelf(
    @Args('bookId', { type: () => String }) bookId: string,
    @Args('shelf', { type: () => String }) shelf: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.userBookService.addBookToShelf(bookId, user.userId, shelf);
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => UserBook, { name: 'removeBookFromShelf' })
  async removeUserBookFromShelf(
    @Args('bookId', { type: () => String }) bookId: string,
    @Args('shelf', { type: () => String }) shelf: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.userBookService.removeBookFromShelf(bookId, user.userId, shelf);
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => UserBook, { nullable: true, name: 'createUserBook' })
  async createUserBook(
    @Args('id')
    id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    let bookId;
    if (this.containsNonNumeric(id)) {
      const identifier = await this.identifiersService.findFirst({
        where: {
          source: 'GOOGLE',
          sourceId: id,
        },
        include: {
          book: true, // Include related book information if needed
        },
      });
      bookId = identifier.bookId;
    } else {
      bookId = id;
    }
    return this.userBookService.create(bookId, user.userId);
  }

  @UseGuards(AccessTokenGuard)
  @Query(() => UserBook, { nullable: true, name: 'userBook' })
  userBook(
    @Args('where')
    where: BookWhereUniqueInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.userBookService.findUnique({
      userId: user.userId,
      bookId: where.id,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Query(() => UserBooksResponse)
  getUserBooks(
    @Args('where', { nullable: true })
    where: UserBookWhereInput,
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
      orderBy: orderBy,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Query(() => Int)
  countUserBooks(
    @Args('where', { nullable: true })
    where: UserBookWhereInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.userBookService.count({
      where,
      userId: user.userId,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => UserBook)
  updateUserBook(
    @Args('data')
    data: UserBookUpdateInput,
    @Args('where') where: BookWhereUniqueInput,
    @CurrentUser() user: JwtPayload,
  ) {
    const userBook = this.userBookService.findUnique({
      userId: user.userId,
      bookId: where.id,
    });
    if (!userBook) {
      throw new NotFoundException(
        `User book ${JSON.stringify(where)} does not exist`,
      );
    }
    //  move recently updated to the top
    return this.userBookService.update({
      data,
      where: {
        userId: user.userId,
        bookId: where.id,
      },
    });
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => [UserBook])
  updateUserBookOrder(
    @Args('data')
    data: UserBookUpdateOrderInput,
    @CurrentUser() user: JwtPayload,
  ) {
    const { items } = data;
    return this.userBookService.updateOrder(items, user.userId);
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => Boolean)
  async importUserBooks(
    @Args('content')
    content: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const lines = content.split('\n'); // -1 for empty last line, -1 for the top row
    const mappings = parseLineWithQuotes(lines[0]);
    const failedBooks = [];
    const totalBooks = lines.length - 2;
    for (let i = 1; i < lines.length - 1; i++) {
      const goodreadsBook = processCSVLine(lines[i], mappings);
      const [book, imageLinks] = await Promise.all([
        buildBook(goodreadsBook), //Get google or open library book
        getCovers({
          isbn: goodreadsBook['ISBN13'],
          title: goodreadsBook['Title'],
          author: goodreadsBook['Author'],
        }),
      ]);

      if (book) {
        const { shelves, status, rating } = getUserBookInfo(goodreadsBook);
        const coverInput: CoverCreateInput[] =
          this.coverService.createCoverInput({
            small: (imageLinks && imageLinks.small) || book.imageLinks.small,
            large: (imageLinks && imageLinks.large) || book.imageLinks.medium,
          });

        const identifiersInput: IdentifierCreateInput[] = [
          {
            source: SOURCE.GOODREADS,
            sourceId: goodreadsBook['Book Id'],
          },
          {
            source: book.source as SOURCE,
            sourceId: book.id,
          },
          ...(book.isbn10
            ? [{ source: SOURCE.ISBN_10, sourceId: book.isbn10 }]
            : []),
          ...(book.isbn13
            ? [{ source: SOURCE.ISBN_13, sourceId: book.isbn13 }]
            : []),
        ];

        const bookInput =
          await this.bookService.createBookInputFromBookData(book);
        const currentBook = await this.bookService.create(
          bookInput,
          identifiersInput,
          coverInput,
        );

        await this.userBookService.create(currentBook.id, user.userId);

        const userBookData: UserBookUpdateInput = {
          status,
          rating: Number(rating),
          shelves,
        };

        await this.userBookService.update({
          data: userBookData,
          where: {
            userId: user.userId,
            bookId: currentBook.id,
          },
          isImport: true,
        });
      } else {
        failedBooks.push(`${goodreadsBook.Title} ${goodreadsBook.Author}`);
      }
    }
    // if successful send email
    await this.resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: user.email,
      subject: 'Confirm your email',
      html: render(
        ImportSummaryEmail({
          totalBooks: totalBooks.toString(),
          successBooks: (totalBooks - failedBooks.length).toString(),
          failedBooks: failedBooks.length.toString(), // Replace with the actual number of failed imports
          summaryLink: 'https://example.com/import-summary', // Replace with the actual link to the import summary
          username: user.username, // Replace with the actual username
          importId: 'import_123456', // Replace with the actual import ID
        }),
      ),
    });

    return true;
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => UserBook)
  removeUserBook(
    @Args('where')
    where: BookWhereUniqueInput,
    @CurrentUser() user: JwtPayload,
  ) {
    const userBook = this.userBookService.findUnique({
      userId: user.userId,
      bookId: where.id,
    });
    if (!userBook) {
      throw new NotFoundException(
        `User book ${JSON.stringify(where)} does not exist`,
      );
    }
    return this.userBookService.remove({
      userId: user.userId,
      bookId: where.id,
    });
  }
}
