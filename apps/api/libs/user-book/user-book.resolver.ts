import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UserBookService } from './user-book.service';
import {
  UserBook,
  UserBookCreateInput,
  UserBookWhereUniqueInput,
} from '../generated-db-types';
import { AccessTokenGuard } from 'libs/auth/guards/jwt.guard';
import { UseGuards } from '@nestjs/common';
import { UniqueUserBookInput } from './dto/uniqueUserBook.input';
import { UpdateUserBookStatusInput } from './dto/updateUserBookStatus.input';

@Resolver(() => UserBook)
export class UserBookResolver {
  constructor(private readonly userBookService: UserBookService) {}

  @Mutation(() => UserBook)
  createUserBook(
    @Args('userBookCreateInput') userBookCreateInput: UserBookCreateInput,
  ) {
    return this.userBookService.create(userBookCreateInput);
  }

  @Query(() => [UserBook], { name: 'userBook' })
  userBooks() {
    return this.userBookService.findAll();
  }

  @Query(() => UserBook, { nullable: true, name: 'userBook' })
  userBook(
    @Args('uniqueUserBookInput')
    uniqueUserBookInput: UniqueUserBookInput,
  ) {
    return this.userBookService.findOne(uniqueUserBookInput);
  }

  //   @UseGuards(AccessTokenGuard)
  @Mutation(() => UserBook)
  updateUserBookStatus(
    @Args('updateUserBookStatusInput')
    updateUserBookStatusInput: UpdateUserBookStatusInput,
  ) {
    return this.userBookService.update(updateUserBookStatusInput);
  }

  @UseGuards(AccessTokenGuard)
  @Mutation(() => UserBook)
  removeUserBook(
    @Args('userBookWhereUniqueInput')
    userBookWhereUniqueInput: UserBookWhereUniqueInput,
  ) {
    return this.userBookService.remove(userBookWhereUniqueInput.id);
  }
}
