import { READING_STATUS } from '@bookshelf/api/generated-db-types';
import { Field, InputType } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
// requests no inputs
@InputType() // Assuming this class represents an object type
export class BookItemInput {
  @IsString()
  @Field()
  id: string;
  @IsString()
  @Field()
  status: READING_STATUS;
  @IsString()
  @Field()
  title: string;
  @IsInt()
  @Field()
  order: number;
}

/**
 * Update userBook input type.
 */
@InputType()
export class UserBookUpdateOrderInput {
  @IsOptional()
  @ValidateNested({ each: true }) // Validate each object within the array
  @Field(() => [BookItemInput], { nullable: true })
  items?: InstanceType<typeof BookItemInput>[];
}
