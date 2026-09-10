import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { LoanStatus } from '@prisma/client';
import { Book } from './book.entity';

registerEnumType(LoanStatus, { name: 'LoanStatus' });

@ObjectType()
export class BookLoan {
  @Field(() => ID)
  id!: string;

  @Field(() => LoanStatus)
  status!: LoanStatus;

  @Field()
  borrowedAt!: Date;

  @Field()
  dueDate!: Date;

  @Field({ nullable: true })
  returnedAt?: Date;

  @Field({ nullable: true })
  fineAmount?: number;

  @Field(() => ID)
  bookId!: string;

  @Field(() => ID)
  borrowerId!: string;

  @Field(() => ID)
  issuedById!: string;

  @Field({ nullable: true })
  bookTitle?: string;

  @Field({ nullable: true })
  borrowerName?: string;

  @Field(() => Book, { nullable: true })
  book?: Book;
}