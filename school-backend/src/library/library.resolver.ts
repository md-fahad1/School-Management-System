import { Resolver, Query, Mutation, Args, ID, Int, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { LoanStatus, Role } from '@prisma/client';
import { LibraryService } from './library.service';
import { Book } from './entities/book.entity';
import { BookLoan } from './entities/book-loan.entity';
import { CreateBookInput, UpdateBookInput } from './dto/book.dto';
import { IssueBookInput, ReturnBookInput } from './dto/book-loan.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

interface RequestUser {
  id: string;
  role: Role;
}

@Resolver(() => Book)
@UseGuards(GqlJwtAuthGuard, RolesGuard)
export class LibraryResolver {
  constructor(private libraryService: LibraryService) {}

  // ---- Books ----

  @Query(() => [Book])
  books(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('search', { type: () => String, nullable: true }) search?: string,
  ) {
    return this.libraryService.findAllBooks(skip, take, search);
  }

  @Query(() => Book)
  book(@Args('id', { type: () => ID }) id: string) {
    return this.libraryService.findOneBook(id);
  }

  @Mutation(() => Book)
  @Roles(Role.ADMIN)
  createBook(@Args('input') input: CreateBookInput) {
    return this.libraryService.createBook(input);
  }

  @Mutation(() => Book)
  @Roles(Role.ADMIN)
  updateBook(@Args('id', { type: () => ID }) id: string, @Args('input') input: UpdateBookInput) {
    return this.libraryService.updateBook(id, input);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN)
  removeBook(@Args('id', { type: () => ID }) id: string) {
    return this.libraryService.removeBook(id);
  }

  // ---- Loans ----

  @Query(() => [BookLoan])
  bookLoans(
    @CurrentUser() user: RequestUser,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('status', { type: () => LoanStatus, nullable: true }) status?: LoanStatus,
  ) {
    return this.libraryService.findAllLoans(user, skip, take, status);
  }

  @Mutation(() => BookLoan)
  @Roles(Role.ADMIN)
  issueBook(@Args('input') input: IssueBookInput, @CurrentUser() user: RequestUser) {
    return this.libraryService.issueBook(input, user.id);
  }

  @Mutation(() => BookLoan)
  @Roles(Role.ADMIN)
  returnBook(@Args('input') input: ReturnBookInput) {
    return this.libraryService.returnBook(input);
  }

  // ---- Joined display fields on BookLoan ----

  @ResolveField('bookTitle', () => String)
  bookTitle(@Parent() loan: any) {
    return loan.book?.title;
  }

  @ResolveField('borrowerName', () => String)
  borrowerName(@Parent() loan: any) {
    const b = loan.borrower;
    if (!b) return undefined;
    return b.username ?? b.email;
  }
}