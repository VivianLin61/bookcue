import { UserBook } from '@bookshelf/api/generated-db-types';
import { Field, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';

@ObjectType()
export class BookCountsResponse {
  @IsNumber()
  @Field()
  wantsToReadCount: number;
  @IsNumber()
  @Field()
  readingCount: number;
  @IsNumber()
  @Field()
  finishedCount: number;
  @IsNumber()
  @Field()
  upNextCount: number;
}
