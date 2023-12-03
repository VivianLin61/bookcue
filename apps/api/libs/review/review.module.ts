import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewResolver } from './review.resolver';
import { PrismaModule } from 'prisma/prisma.module';
import { ReviewRepository } from './review.repository';
import { BookService } from 'libs/book/book.service';
import { UserBookService } from 'libs/user-book/user-book.service';
import { BookRepository } from 'libs/book/book.repository';
import { UserBookRepository } from 'libs/user-book/user-book.repository';

@Module({
  providers: [
    ReviewResolver,
    ReviewService,
    ReviewRepository,
    BookService,
    UserBookService,
    UserBookRepository,
    BookRepository,
  ],
  imports: [PrismaModule],
  exports: [ReviewService],
})
export class ReviewModule {}
