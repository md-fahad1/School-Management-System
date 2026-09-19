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
import { Scholarship } from './entities/scholarship.entity';
import { CreateScholarshipInput, UpdateScholarshipInput } from './dto/scholarship.dto';
import { ApplyDiscountInput, ApplyFineInput } from './dto/discount-fine.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RecordPaymentInput } from './dto/payment.dto';
interface RequestUser {
  id: string;
  role: Role;
}

@Resolver(() => Invoice)
@UseGuards(GqlJwtAuthGuard, RolesGuard, PermissionsGuard)
export class FeesResolver {
  constructor(private feesService: FeesService) {}

  // ---- Fee Structures ----

  @Query(() => [FeeStructure])
  @RequirePermissions('fee:view')
  feeStructures(@Args('gradeId', { type: () => ID, nullable: true }) gradeId?: string) {
    return this.feesService.findAllFeeStructures(gradeId);
  }

  @Query(() => FeeStructure)
  @RequirePermissions('fee:view')
  feeStructure(@Args('id', { type: () => ID }) id: string) {
    return this.feesService.findOneFeeStructure(id);
  }

  @Mutation(() => FeeStructure)
  @Roles(Role.ADMIN)
  @RequirePermissions('fee:create')
  createFeeStructure(@Args('input') input: CreateFeeStructureInput) {
    return this.feesService.createFeeStructure(input);
  }

  @Mutation(() => FeeStructure)
  @Roles(Role.ADMIN)
  @RequirePermissions('fee:update')
  updateFeeStructure(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateFeeStructureInput,
  ) {
    return this.feesService.updateFeeStructure(id, input);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN)
  @RequirePermissions('fee:delete')
  removeFeeStructure(@Args('id', { type: () => ID }) id: string) {
    return this.feesService.removeFeeStructure(id);
  }

  // ---- Invoices ----

  @Query(() => [Invoice])
  @RequirePermissions('fee:view')
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
  @RequirePermissions('fee:view')
  invoice(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: RequestUser) {
    return this.feesService.findOneInvoice(id, user);
  }

  @Mutation(() => Invoice)
  @Roles(Role.ADMIN, Role.ACCOUNTANT)
  @RequirePermissions('fee:create')
  generateInvoice(@Args('input') input: GenerateInvoiceInput) {
    return this.feesService.generateInvoice(input);
  }

  @Mutation(() => String)
  @Roles(Role.ADMIN, Role.ACCOUNTANT)
  @RequirePermissions('fee:create')
  async generateBulkInvoices(@Args('input') input: GenerateBulkInvoicesInput) {
    const result = await this.feesService.generateBulkInvoices(input);
    return `Created ${result.created} invoice(s), skipped ${result.skipped} already-invoiced student(s)`;
  }

  // ---- Payments ----

  @Mutation(() => Payment)
  @Roles(Role.ADMIN, Role.ACCOUNTANT)
  @RequirePermissions('fee:collect')
  recordPayment(@Args('input') input: RecordPaymentInput, @CurrentUser() user: RequestUser) {
    return this.feesService.recordPayment(input, user.id);
  }

  // ---- Reports ----

  @Query(() => [Invoice])
  @Roles(Role.ADMIN, Role.ACCOUNTANT)
  @RequirePermissions('fee:view')
  defaulters(@Args('gradeId', { type: () => ID, nullable: true }) gradeId?: string) {
    return this.feesService.defaulters(gradeId);
  }

  @Query(() => FeeCollectionSummary)
  @Roles(Role.ADMIN, Role.ACCOUNTANT)
  @RequirePermissions('fee:view')
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
    return (
      invoice.balance ??
      invoice.amount - invoice.discountAmount + invoice.fineAmount - invoice.amountPaid
    );
  }

  @ResolveField('payableAmount', () => Number)
  payableAmount(@Parent() invoice: any) {
    return invoice.payableAmount ?? invoice.amount - invoice.discountAmount + invoice.fineAmount;
  }

  // ---- Scholarships ----

  @Query(() => [Scholarship])
  @RequirePermissions('fee:view')
  scholarships(
    @CurrentUser() user: RequestUser,
    @Args('studentId', { type: () => ID, nullable: true }) studentId?: string,
  ) {
    return this.feesService.findScholarships(user, studentId);
  }

  @Mutation(() => Scholarship)
  @Roles(Role.ADMIN, Role.ACCOUNTANT)
  @RequirePermissions('fee:create')
  createScholarship(@Args('input') input: CreateScholarshipInput) {
    return this.feesService.createScholarship(input);
  }

  @Mutation(() => Scholarship)
  @Roles(Role.ADMIN, Role.ACCOUNTANT)
  @RequirePermissions('fee:update')
  updateScholarship(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateScholarshipInput,
  ) {
    return this.feesService.updateScholarship(id, input);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN, Role.ACCOUNTANT)
  @RequirePermissions('fee:delete')
  removeScholarship(@Args('id', { type: () => ID }) id: string) {
    return this.feesService.removeScholarship(id);
  }

  // ---- Discount / Fine on a single invoice ----

  @Mutation(() => Invoice)
  @Roles(Role.ADMIN, Role.ACCOUNTANT)
  @RequirePermissions('fee:update')
  applyInvoiceDiscount(
    @Args('invoiceId', { type: () => ID }) invoiceId: string,
    @Args('input') input: ApplyDiscountInput,
  ) {
    return this.feesService.applyInvoiceDiscount(invoiceId, input);
  }

  @Mutation(() => Invoice)
  @Roles(Role.ADMIN, Role.ACCOUNTANT)
  @RequirePermissions('fee:update')
  applyInvoiceFine(
    @Args('invoiceId', { type: () => ID }) invoiceId: string,
    @Args('input') input: ApplyFineInput,
  ) {
    return this.feesService.applyInvoiceFine(invoiceId, input);
  }
    @ResolveField('studentName', () => String, { nullable: true }, )
  scholarshipStudentName() {
    return undefined; // placeholder guard below overrides this — see note
  }
}