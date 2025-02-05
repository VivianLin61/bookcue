import { IdentifierWhereInput } from '@bookshelf/api/generated-db-types';
import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

@InputType()
export class ShelvesForBookRequest {
  @ValidateNested()
  @IsNotEmpty()
  @Field()
  bookIdentifier: IdentifierWhereInput;
  // the user who created the shelf
  @IsNotEmpty()
  @IsString()
  @Field()
  user: string;
  // what do they call the author of the shelfves?
  @IsNotEmpty()
  @IsString()
  @Field()
  email: string;
}
