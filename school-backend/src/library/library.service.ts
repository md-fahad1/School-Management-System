import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { LoanStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookInput, UpdateBookInput } from './dto/book.dto';
import { IssueBookInput, ReturnBookInput } from './dto/book-loan.dto';
import { requireInstitutionId } from '../tenant/tenant-context';
interface RequestUser {
  id: string;
  role: Role;
}

@Injectable()
export class LibraryService {
  constructor(private prisma: PrismaService) {}

  // ---- Books ----

  findAllBooks(skip = 0, take = 20, search?: string) {
    return this.prisma.book.findMany({
      where: search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { author: { contains: search, mode: 'insensitive' } },
              { isbn: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      skip,
      take,
      orderBy: { title: 'asc' },
    });
  }

  async findOneBook(id: string) {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) throw new NotFoundException(`Book ${id} not found`);
    return book;
  }

  async createBook(input: CreateBookInput) {
    const existing = await this.prisma.book.findFirst({ where: { isbn: input.isbn } });
    if (existing) throw new BadRequestException(`A book with ISBN ${input.isbn} already exists`);
    return this.prisma.book.create({
      data: { ...input, availableCopies: input.totalCopies, institutionId: requireInstitutionId() },
    });
  }

  async updateBook(id: string, input: UpdateBookInput) {
    const book = await this.findOneBook(id);

    // If totalCopies changes, shift availableCopies by the same delta so
    // copies already on loan stay accounted for correctly.
    let availableCopies = book.availableCopies;
    if (input.totalCopies !== undefined) {
      const delta = input.totalCopies - book.totalCopies;
      availableCopies = book.availableCopies + delta;
      if (availableCopies < 0) {
        throw new BadRequestException(
          `Cannot reduce total copies below the ${book.totalCopies - book.availableCopies} currently on loan`,
        );
      }
    }

    return this.prisma.book.update({
      where: { id },
      data: { ...input, availableCopies },
    });
  }

  async removeBook(id: string) {
    const book = await this.findOneBook(id);
    if (book.availableCopies < book.totalCopies) {
      throw new BadRequestException('Cannot delete a book that has copies currently on loan');
    }
    await this.prisma.book.delete({ where: { id } });
    return true;
  }

  // ---- Loans ----

  async findAllLoans(user: RequestUser, skip = 0, take = 20, status?: LoanStatus) {
    const where = await this.visibilityFilter(user, status);
    return this.prisma.bookLoan.findMany({
      where,
      skip,
      take,
      orderBy: { borrowedAt: 'desc' },
      include: { book: true, borrower: true },
    });
  }

  async issueBook(input: IssueBookInput, issuedById: string) {
    return this.prisma.$transaction(async (tx) => {
      const book = await tx.book.findUnique({ where: { id: input.bookId } });
      if (!book) throw new NotFoundException(`Book ${input.bookId} not found`);
      if (book.availableCopies < 1) {
        throw new BadRequestException(`No available copies of "${book.title}" left`);
      }

      const borrower = await tx.user.findUnique({ where: { id: input.borrowerId } });
      if (!borrower) throw new NotFoundException(`User ${input.borrowerId} not found`);

      const alreadyBorrowed = await tx.bookLoan.findFirst({
        where: { bookId: input.bookId, borrowerId: input.borrowerId, status: LoanStatus.BORROWED },
      });
      if (alreadyBorrowed) {
        throw new BadRequestException('This person already has an active loan for this book');
      }

      await tx.book.update({
        where: { id: input.bookId },
        data: { availableCopies: { decrement: 1 } },
      });

      return tx.bookLoan.create({
        data: {
          bookId: input.bookId,
          borrowerId: input.borrowerId,
          issuedById,
          dueDate: new Date(input.dueDate),
        },
        include: { book: true, borrower: true },
      });
    });
  }

  async returnBook(input: ReturnBookInput) {
    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.bookLoan.findUnique({ where: { id: input.loanId } });
      if (!loan) throw new NotFoundException(`Loan ${input.loanId} not found`);
      if (loan.status === LoanStatus.RETURNED) {
        throw new BadRequestException('This book has already been returned');
      }

      const returnedAt = new Date();
      const isLate = returnedAt > loan.dueDate;
      // 0.50 per day late — tweak to your currency/policy as needed.
      const fineAmount = isLate
        ? Math.ceil((returnedAt.getTime() - loan.dueDate.getTime()) / 86_400_000) * 0.5
        : null;

      await tx.book.update({
        where: { id: loan.bookId },
        data: { availableCopies: { increment: 1 } },
      });

      return tx.bookLoan.update({
        where: { id: input.loanId },
        data: { status: LoanStatus.RETURNED, returnedAt, fineAmount },
        include: { book: true, borrower: true },
      });
    });
  }

  private async visibilityFilter(user: RequestUser, status?: LoanStatus) {
    const statusFilter = status ? { status } : {};
    if (user.role === Role.ADMIN) return statusFilter;
    // Everyone else only sees their own loan history.
    return { ...statusFilter, borrowerId: user.id };
  }
}