import { Resolver, Query, Mutation, Args, ID, Int, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PaymentStatus, Role } from '@prisma/client';
import { FeesService } from './fees.service';
import { FeeStructure } from './entities/fee-structure.entity';
import { Invoice } from './entities/invoice.entity';
import { Payment } from './entities/payment.entity';
import { FeeCollectionSummary } from './entities/fee-summary.entity';
import { CreateFeeStructureInput, UpdateFeeStructureInput } from './dto/fee-structure.dto';
import { GenerateInvoiceInput, GenerateBulkInvoicesInput } from './dto/invoice.dto';
import { RecordPaymentInput } from './dto/payment.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

interface RequestUser {
  id: string;
  role: Role;
}

@Resolver(() => Invoice)
@UseGuards(GqlJwtAuthGuard, RolesGuard)
export class FeesResolver {
  constructor(private feesService: FeesService) {}

  // ---- Fee Structures ----

  @Query(() => [FeeStructure])
  feeStructures(@Args('gradeId', { type: () => ID, nullable: true }) gradeId?: string) {
    return this.feesService.findAllFeeStructures(gradeId);
  }

  @Query(() => FeeStructure)
  feeStructure(@Args('id', { type: () => ID }) id: string) {
    return this.feesService.findOneFeeStructure(id);
  }

  @Mutation(() => FeeStructure)
  @Roles(Role.ADMIN)
  createFeeStructure(@Args('input') input: CreateFeeStructureInput) {
    return this.feesService.createFeeStructure(input);
  }

  @Mutation(() => FeeStructure)
  @Roles(Role.ADMIN)
  updateFeeStructure(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateFeeStructureInput,
  ) {
    return this.feesService.updateFeeStructure(id, input);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN)
  removeFeeStructure(@Args('id', { type: () => ID }) id: string) {
    return this.feesService.removeFeeStructure(id);
  }

  // ---- Invoices ----

  @Query(() => [Invoice])
  invoices(
    @CurrentUser() user: RequestUser,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('status', { type: () => PaymentStatus, nullable: true }) status?: PaymentStatus,
    @Args('studentId', { type: () => ID, nullable: true }) studentId?: string,
  ) {
    return this.feesService.findAllInvoices(user, skip, take, status, studentId);
  }

  @Query(() => Invoice)
  invoice(@Args('id', { type: () => ID }) id: string) {
    return this.feesService.findOneInvoice(id);
  }

  @Mutation(() => Invoice)
  @Roles(Role.ADMIN)
  generateInvoice(@Args('input') input: GenerateInvoiceInput) {
    return this.feesService.generateInvoice(input);
  }

  @Mutation(() => String)
  @Roles(Role.ADMIN)
  async generateBulkInvoices(@Args('input') input: GenerateBulkInvoicesInput) {
    const result = await this.feesService.generateBulkInvoices(input);
    return `Created ${result.created} invoice(s), skipped ${result.skipped} already-invoiced student(s)`;
  }

  // ---- Payments ----

  @Mutation(() => Payment)
  @Roles(Role.ADMIN)
  recordPayment(@Args('input') input: RecordPaymentInput, @CurrentUser() user: RequestUser) {
    return this.feesService.recordPayment(input, user.id);
  }

  // ---- Reports ----

  @Query(() => [Invoice])
  @Roles(Role.ADMIN)
  defaulters(@Args('gradeId', { type: () => ID, nullable: true }) gradeId?: string) {
    return this.feesService.defaulters(gradeId);
  }

  @Query(() => FeeCollectionSummary)
  @Roles(Role.ADMIN)
  feeCollectionSummary(@Args('period', { nullable: true }) period?: string) {
    return this.feesService.collectionSummary(period);
  }

  // ---- Joined display fields ----

  @ResolveField('studentName', () => String, { nullable: true })
  studentName(@Parent() invoice: any) {
    if (invoice.studentName) return invoice.studentName;
    const s = invoice.student;
    return s ? `${s.name} ${s.surname}` : undefined;
  }

  @ResolveField('balance', () => Number)
  balance(@Parent() invoice: any) {
    return invoice.balance ?? invoice.amount - invoice.amountPaid;
  }
}