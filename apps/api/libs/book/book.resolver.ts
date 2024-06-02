import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { BookService } from './book.service';
import {
  Book,
  BookCreateInput,
  BookWhereUniqueInput,
  CoverCreateInput,
  IdentifierCreateInput,
  SOURCE,
} from 'src/generated-db-types';
import { AccessTokenGuard } from 'libs/auth/guards/jwt.guard';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'libs/auth/decorators/currentUser.decorator';
import { JwtPayload } from 'libs/auth/types';
import { CoverService } from 'libs/cover/cover.service';
import { findBookByGoogleBookId } from './api/google.api';
import { getCovers } from './api/book-cover.api';
import { generateSlug } from 'libs/user-book/utils';
import { IdentifierService } from 'libs/identifier/identifier.service';
import { UserBookService } from 'libs/user-book/user-book.service';

@Resolver(() => Book)
export class BookResolver {
  constructor(
    private readonly bookService: BookService,
    private readonly coverService: CoverService,
    private readonly userBookService: UserBookService,
    private readonly identifierService: IdentifierService,
  ) {}

  @Query(() => String, { nullable: true, name: 'slug' })
  async getBookSlug(
    @Args('id')
    id: string,
  ) {
    const googleBook = await findBookByGoogleBookId(id);
    const identifier = await this.identifierService.findFirst({
      where: {
        source: SOURCE.GOOGLE,
        sourceId: googleBook.id,
      },
    });

    if (!identifier) {
      const imageLinks = await getCovers({
        isbn: googleBook.isbn13,
        title: googleBook.title,
        author: googleBook.authors[0],
      });
      const coversInput: CoverCreateInput[] =
        this.coverService.createCoverInput(imageLinks);

      const identifiersInput: IdentifierCreateInput[] = [
        {
          source: SOURCE.GOOGLE,
          sourceId: googleBook.id,
        },
        ...(googleBook.isbn10
          ? [{ source: SOURCE.ISBN_10, sourceId: googleBook.isbn10 }]
          : []),
        ...(googleBook.isbn13
          ? [{ source: SOURCE.ISBN_13, sourceId: googleBook.isbn13 }]
          : []),
      ];

      const bookInput =
        await this.bookService.createBookInputFromBookData(googleBook);

      const book = await this.bookService.create(
        bookInput,
        identifiersInput,
        coversInput,
      );

      return book;
    }
  }
  @Query(() => Book, { nullable: true, name: 'getGoogleBook' })
  async getGoogleBook(
    @Args('id')
    id: string,
  ) {
    const googleBook = await findBookByGoogleBookId(id);
    const identifier = await this.identifierService.findFirst({
      where: {
        source: 'GOOGLE',
        sourceId: googleBook.id,
      },
      include: {
        book: {
          include: {
            covers: true,
          },
        }, // Include related book information if needed
      },
    });

    if (!identifier) {
      const imageLinks = await getCovers({
        isbn: googleBook.isbn13,
        title: googleBook.title,
        author: googleBook.authors[0],
      });
      const coversInput: CoverCreateInput[] =
        this.coverService.createCoverInput(imageLinks);

      const bookInput: BookCreateInput =
        await this.bookService.createBookInputFromBookData(googleBook);
      //Create identifiers
      const identifiersInput: IdentifierCreateInput[] = [
        {
          source: SOURCE.GOOGLE,
          sourceId: googleBook.id,
        },
        ...(googleBook.isbn10
          ? [{ source: SOURCE.ISBN_10, sourceId: googleBook.isbn10 }]
          : []),
        ...(googleBook.isbn13
          ? [{ source: SOURCE.ISBN_13, sourceId: googleBook.isbn13 }]
          : []),
      ];
      const book = await this.bookService.create(
        bookInput,
        identifiersInput,
        coversInput,
      );

      return book;
    }
    return identifier.book;

    // get the google book,
    // create check if there already exist a book with the this googleBookId
    // if there is just return the book else
    // then return the create the book,
    // check if there is a matching work, same title and author if there is add it as a edition
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => Book)
  async createBook(
    @Args('data') data: BookCreateInput,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    const book = await this.bookService.create(data);
    await this.userBookService.create(book.id, currentUser.userId);
    return book;
  }

  @Query(() => Book, { nullable: true, name: 'book' })
  book(
    @Args('where')
    where: BookWhereUniqueInput,
  ) {
    const book = this.bookService.findUnique({
      where: {
        id: where.id,
      },
      include: {
        covers: true,
      },
    });

    if (!book) {
      throw new NotFoundException(
        `Book ${JSON.stringify(where)} does not exist`,
      );
    }
    return book;
  }
}
