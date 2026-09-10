import { InputType, Field, ID } from '@nestjs/graphql';
import { IsDateString, IsUUID } from 'class-validator';

@InputType()
export class IssueBookInput {
  @Field(() => ID)
  @IsUUID()
  bookId!: string;

  @Field(() => ID)
  @IsUUID()
  borrowerId!: string;

  @Field()
  @IsDateString()
  dueDate!: string;
}

@InputType()
export class ReturnBookInput {
  @Field(() => ID)
  @IsUUID()
  loanId!: string;
}