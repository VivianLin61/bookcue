import { UserBook } from '@bookshelf/api/generated-db-types';
import { Field, ObjectType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';

@ObjectType()
export class UserBooksResponse {
  @IsOptional()
  @ValidateNested({ each: true }) // Validate each object within the array
  @Field(() => [UserBook], { nullable: true })
  userBooks?: InstanceType<typeof UserBook>[];
  @IsBoolean()
  @Field()
  hasMore: boolean;
  @IsNumber()
  @Field()
  totalBooks: number;
}
