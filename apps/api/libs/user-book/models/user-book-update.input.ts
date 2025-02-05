import { READING_STATUS } from '@bookshelf/api/generated-db-types';
import { Field, InputType } from '@nestjs/graphql';
import {
  ArrayUnique,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/**
 * Update userBook input type.
 */
@InputType()
export class UserBookUpdateInput {
  @IsOptional()
  @IsNotEmpty()
  @Field(() => READING_STATUS, { nullable: true })
  status?: READING_STATUS;

  @IsOptional()
  @Min(0)
  @Max(5)
  @IsInt()
  @Field(() => Number, { nullable: true })
  rating?: number;

  @IsOptional()
  @IsString({ each: true })
  @ArrayUnique()
  @Field(() => [String], { nullable: true })
  shelves?: string[];
}
