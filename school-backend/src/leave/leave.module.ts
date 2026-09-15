import { Module } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { LeaveResolver } from './leave.resolver';

@Module({
  providers: [LeaveService, LeaveResolver],
})
export class LeaveModule {}