import { Field, InputType } from '@nestjs/graphql';
import {
  ArrayUnique,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CoverCreateInput,
  IdentifierCreateInput,
  RatingCreateInput,
} from '@bookshelf/api/generated-db-types';

@InputType()
export class BookDataInput {
  @Field(() => [IdentifierCreateInput])
  @ValidateNested({ each: true })
  @Type(() => IdentifierCreateInput)
  @IsArray()
  @ArrayUnique()
  identifiers: IdentifierCreateInput[];

  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  slug?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  subtitle?: string;

  @Field(() => [String])
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  authors: string[];

  @Field(() => [RatingCreateInput])
  @ValidateNested({ each: true })
  @Type(() => RatingCreateInput)
  @IsArray()
  @ArrayUnique()
  ratings: RatingCreateInput[];

  @Field(() => [CoverCreateInput])
  @ValidateNested({ each: true })
  @Type(() => CoverCreateInput)
  @IsArray()
  @ArrayUnique()
  covers: CoverCreateInput[];

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  yearPublished?: string;

  @Field()
  @IsInt()
  @Min(0)
  pageCount: number;
}
