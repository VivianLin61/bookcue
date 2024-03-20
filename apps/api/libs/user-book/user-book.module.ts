import { Module } from '@nestjs/common';
import { UserBookService } from './user-book.service';
import { UserBookResolver } from './user-book.resolver';
import { PrismaModule } from 'prisma/prisma.module';
import { UserBookRepository } from './user-book.repository';
import { BookService } from 'libs/book/book.service';
import { BookRepository } from 'libs/book/book.repository';
import { HttpModule } from '@nestjs/axios';
import { ActivityService } from 'libs/activity/activity.service';
import { ActivityRepository } from 'libs/activity/activity.respository';
import { AuthorService } from 'libs/author/author.service';
import { WorkService } from 'libs/work/work.service';
import { WorkRepository } from 'libs/work/work.repository';
import { CoverService } from 'libs/cover/cover.service';
import { CoverRepository } from 'libs/cover/cover.repository';

@Module({
  providers: [
    UserBookRepository,
    UserBookResolver,
    UserBookService,
    BookService,
    BookRepository,
    ActivityRepository,
    ActivityService,
    AuthorService,
    WorkService,
    WorkRepository,
    CoverService,
    CoverRepository,
  ],
  imports: [PrismaModule, HttpModule],
  exports: [UserBookService],
})
export class UserBookModule {}
