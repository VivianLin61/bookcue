import { Injectable } from '@nestjs/common';
import {
  CoverCreateInput,
  IdentifierCreateInput,
  UserBookIdentifierCompoundUniqueInput,
} from '../../src/generated-db-types';
import { Prisma, SOURCE } from '@prisma/client';
import { UserBookRepository } from './user-book.repository';
import { UserBookUpdateInput } from './models/user-book-update.input';
import { BookItemInput } from './models/user-book-update-order.input';
import { PrismaRepository } from 'prisma/prisma.repository';
import { ActivityService } from 'libs/activity/activity.service';
import { getUserBookInfo } from './utils';
import { CoverService } from 'libs/cover/cover.service';
import { BookService } from 'libs/book/book.service';
import { IdentifierService } from 'libs/identifier/identifier.service';
@Injectable()
export class UserBookService {
  constructor(
    private readonly repository: UserBookRepository,
    private readonly activityService: ActivityService,
    private readonly bookService: BookService,
    private readonly coverService: CoverService,
    private readonly identifierService: IdentifierService,
    private readonly prisma: PrismaRepository,
  ) {}
  async removeBookFromShelf(bookId: string, userId: string, shelf: string) {
    // Retrieve the userBook to see if it exists and to get the current shelves
    const userBook = await this.repository.findUnique({
      where: {
        identifier: {
          userId,
          bookId,
        },
      },
      include: {
        shelves: {
          include: {
            shelf: true,
          },
        },
      },
    });

    // If the userBook exists, check if the shelf is associated with it
    if (userBook) {
      const shelfList = userBook.shelves.map((shelfRelation) => ({
        name: shelfRelation.shelf.name,
        id: shelfRelation.shelf.id,
      }));
      if (shelfList.some((shelfObj) => shelfObj.name === shelf)) {
        // Remove the shelf from the list
        const updatedShelfList = shelfList.filter(
          (shelfObj) => shelfObj.name !== shelf,
        );
        return this.repository.update({
          data: {
            shelves: {
              deleteMany: { userBookId: userBook.id },
              create: updatedShelfList.map((shelfObj) => ({
                shelf: {
                  connectOrCreate: {
                    where: { identifier: { userId, name: shelfObj.name } },
                    create: { userId, name: shelfObj.name },
                  },
                },
              })),
            },
          },
          where: {
            identifier: {
              userId,
              bookId,
            },
          },
        });
      }
    } else {
      // If the userBook does not exist, throw an error or handle accordingly
      throw new Error('Book not found on user shelf.');
    }
  }
  async addBookToShelf(bookId: string, userId: string, shelf: string) {
    // Check if the book is already associated with the user
    const userBook = await this.repository.findUnique({
      where: {
        identifier: {
          userId,
          bookId,
        },
      },
      include: {
        shelves: {
          include: {
            shelf: true,
          },
        },
      },
    });

    // If the userBook exists, update it to include the "favorites" shelf
    const shelfList = userBook?.shelves.map((shelf) => shelf.shelf.name);
    if (userBook) {
      return this.update({
        data: { shelves: [...shelfList, shelf] }, // Assuming shelves is an array of shelf names
        where: { userId, bookId },
      });
    }
  }

  async create(bookId: string, userId: string, status?: string) {
    const lastUserBook = await this.repository.findFirst({
      where: { status: status || 'Want to Read', userId: userId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const newOrder = lastUserBook ? lastUserBook.order + 1 : 1;

    const createUserBookArgs: Prisma.UserBookCreateArgs = {
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        book: {
          connect: {
            id: bookId,
          },
        },

        title: '',
        status: status || 'Want to Read',
      },
    };

    return this.repository.create(createUserBookArgs);
  }

  async findUnique(where: UserBookIdentifierCompoundUniqueInput) {
    const { userId, bookId } = where;
    const userBook = await this.repository.findUnique({
      where: {
        identifier: {
          userId,
          bookId,
        },
      },
      include: {
        shelves: {
          include: {
            shelf: true,
          },
        },
      },
    });
    return userBook;
  }

  async findMany(args: {
    where: Prisma.UserBookWhereInput;
    userId: string;
    skip?: number;
    take?: number;
    orderBy?: Prisma.UserBookOrderByWithRelationInput;
  }) {
    const { userId } = args;
    const userBooks = await this.repository.findMany({
      where: {
        ...args.where,
        userId,
      },
      include: {
        _count: {
          select: {
            shelves: true,
            journalEntry: true,
          },
        },
        covers: {
          select: {
            url: true,
            size: true,
          },
        },
        shelves: {
          include: {
            shelf: true,
          },
        },
        identifiers: {
          select: {
            source: true,
            sourceId: true,
          },
        },
        journalEntry: {
          orderBy: {
            dateRead: 'desc', // Order by dateRead in descending order
          },
          take: 1, // Take only the last element
        },
      },
      orderBy: args.orderBy,
      skip: args.skip,
      take: args.take,
    });
    const totalBooksCount = await this.count({
      where: args.where,
      userId,
    });

    // Calculate hasMore
    const hasMore = args.skip + userBooks.length < totalBooksCount;

    return {
      userBooks,
      hasMore,
      totalBooks: totalBooksCount,
    };
  }

  async count(args: { where: Prisma.UserBookWhereInput; userId: string }) {
    const { userId } = args;

    const userBooksCount = await this.repository.count({
      where: {
        ...args.where,
        userId,
      },
    });

    return userBooksCount;
  }
  async updateOrder(items: BookItemInput[], userId: string) {
    let updatedCards = [];

    try {
      //   const transaction = items.map((book) =>
      //     this.repository.update({
      //       where: {
      //         id: 'FIX_ME_ID',
      //         // identifier: {
      //         //   userId,
      //         //   bookId: book.id,
      //         // },
      //       },
      //       data: {
      //         order: book.order,
      //         status: book.status,
      //       },
      //     }),
      //   );
      //   updatedCards = await this.prisma.$transaction(transaction);
    } catch (error) {
      console.log(error);
      throw new Error('Error updating order');
    }
    return updatedCards;
  }

  async update(args: {
    data: UserBookUpdateInput;
    where: UserBookIdentifierCompoundUniqueInput;
    isImport?: boolean;
  }) {
    const { userId, bookId } = args.where;

    const origin = await this.repository.findUnique({
      where: {
        identifier: {
          userId,
          bookId,
        },
      },
      include: {
        shelves: {
          include: {
            shelf: true,
          },
        },
        book: true,
      },
    });

    const shelfList = args.data.shelves;
    let newOrder;

    // Use a transaction to ensure atomicity
    return await this.prisma.$transaction(async (prisma) => {
      // if status is updated, update order number in the new status
      if (args.data.status && !args.isImport) {
        // Increment the 'order' field by 1 for all matched records.
        await prisma.userBook.updateMany({
          where: {
            userId: userId,
            status: args.data.status,
          },
          data: {
            order: {
              increment: 1,
            },
          },
        });

        // Set the new order for the updated book to 0.
        newOrder = 0;

        // Create status update activity
        this.activityService.create(
          {
            action: 'STATUS_UPDATE',
            actionContent: args.data.status,
          },
          userId,
          origin.book.id,
        );
      }

      // if rating is updated, create rating activity
      if (args.data.rating && !args.isImport) {
        this.activityService.create(
          {
            action: 'RATE',
            actionContent: args.data.rating.toString(),
          },
          userId,
          origin.book.id,
        );
      }

      // Create activity for shelving a book
      if (args.data.shelves && !args.isImport) {
        this.activityService.create(
          {
            action: 'SHELVE',
            actionContent: args.data.shelves.join(', '),
          },
          userId,
          origin.book.id,
        );
      }

      // Update the UserBook record within the transaction
      const updateUserBook = await prisma.userBook.update({
        where: {
          identifier: {
            userId,
            bookId,
          },
        },
        data: {
          order: newOrder,
          status: args.data.status,
          rating: args.data.rating,
          shelves: shelfList
            ? {
                deleteMany: { userBookId: origin.id },
                create: shelfList.map((name: string) => ({
                  shelf: {
                    connectOrCreate: {
                      where: { identifier: { userId, name } },
                      create: { userId, name },
                    },
                  },
                })),
              }
            : undefined,
        },
        include: {
          book: true,
          shelves: {
            include: {
              shelf: true,
            },
          },
        },
      });

      return updateUserBook;
    });
  }

  async remove(where: UserBookIdentifierCompoundUniqueInput) {
    const { userId, bookId } = where;
    const userBook = await this.repository.delete({
      where: {
        identifier: {
          userId,
          bookId,
        },
      },
      include: {
        shelves: {
          include: {
            shelf: true,
          },
        },
      },
    });
    return userBook;
  }
  async createImportedBook(userInfo, book, imageLinks, user) {
    const { shelves, status, rating } = userInfo;
    const { userId } = user;
    const coverInput: CoverCreateInput[] = this.coverService.createCoverInput({
      small: imageLinks && imageLinks.small,
      large: imageLinks && imageLinks.large,
    });

    const identifiersInput: IdentifierCreateInput[] = [
      {
        source: SOURCE.GOODREADS,
        sourceId: book.id,
      },
      ...(book.isbn10
        ? [{ source: SOURCE.ISBN_10, sourceId: book.isbn10 }]
        : []),
      ...(book.isbn13
        ? [{ source: SOURCE.ISBN_13, sourceId: book.isbn13 }]
        : []),
    ];
    // Check if there already exists a userbook with the same identifiers, return existing userBook
    if (identifiersInput.length > 0) {
      const existingUserBook = await this.repository.findFirst({
        where: {
          userId,
          identifiers: {
            some: {
              OR: identifiersInput.map(({ source, sourceId }) => ({
                source,
                sourceId,
              })),
            },
          },
        },
      });
      if (existingUserBook) {
        return existingUserBook;
      }
    }

    // Prepare the identifiers connection
    const identifiers = await this.identifierService.createMany(
      identifiersInput ?? [],
    );
    // Prepare the covers connection if covers exist
    const covers = await this.coverService.createMany(coverInput ?? []);

    // Create the book with conditional covers connection
    const createUserBookArgs: Prisma.UserBookCreateArgs = {
      data: {
        title: book.title,
        subtitle: book.subtitle,
        authors: book.authors,
        pageCount: book.pageCount,
        covers: {
          connect: covers?.length
            ? covers.map((cover) => ({ url: cover.url }))
            : undefined,
        },
        identifiers: {
          connect: identifiers?.length
            ? identifiers.map((identifier) => ({
                id: identifier.id,
              }))
            : undefined,
        },
        shelves: shelves
          ? {
              create: shelves.map((name: string) => ({
                shelf: {
                  connectOrCreate: {
                    where: { identifier: { userId, name } },
                    create: { userId, name },
                  },
                },
              })),
            }
          : undefined,
        user: {
          connect: {
            id: userId,
          },
        },
        status: status || 'Want to Read',
        rating: Number(rating),
      },
    };

    return await this.prisma.userBook.create(createUserBookArgs);
  }
}
