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
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

interface RequestUser {
  id: string;
  role: Role;
}

@Resolver(() => Book)
@UseGuards(GqlJwtAuthGuard, RolesGuard, PermissionsGuard)
export class LibraryResolver {
  constructor(private libraryService: LibraryService) {}

  // ---- Books ----

  @Query(() => [Book])
  @RequirePermissions('book:view')
  books(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('search', { type: () => String, nullable: true }) search?: string,
  ) {
    return this.libraryService.findAllBooks(skip, take, search);
  }

  @Query(() => Book)
  @RequirePermissions('book:view')
  book(@Args('id', { type: () => ID }) id: string) {
    return this.libraryService.findOneBook(id);
  }

  @Mutation(() => Book)
  @Roles(Role.ADMIN)
  @RequirePermissions('book:create')
  createBook(@Args('input') input: CreateBookInput) {
    return this.libraryService.createBook(input);
  }

  @Mutation(() => Book)
  @Roles(Role.ADMIN)
  @RequirePermissions('book:update')
  updateBook(@Args('id', { type: () => ID }) id: string, @Args('input') input: UpdateBookInput) {
    return this.libraryService.updateBook(id, input);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN)
  @RequirePermissions('book:delete')
  removeBook(@Args('id', { type: () => ID }) id: string) {
    return this.libraryService.removeBook(id);
  }

  // ---- Loans ----

  @Query(() => [BookLoan])
  @RequirePermissions('bookLoan:view')
  bookLoans(
    @CurrentUser() user: RequestUser,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('status', { type: () => LoanStatus, nullable: true }) status?: LoanStatus,
  ) {
    return this.libraryService.findAllLoans(user, skip, take, status);
  }

  @Mutation(() => BookLoan)
 @Roles(Role.ADMIN, Role.LIBRARIAN)
 @RequirePermissions('bookLoan:issue')
  issueBook(@Args('input') input: IssueBookInput, @CurrentUser() user: RequestUser) {
    return this.libraryService.issueBook(input, user.id);
  }

  @Mutation(() => BookLoan)
  @Roles(Role.ADMIN, Role.LIBRARIAN)
  @RequirePermissions('bookLoan:return')
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