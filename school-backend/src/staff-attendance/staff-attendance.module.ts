import { Module } from '@nestjs/common';
import { StaffAttendanceService } from './staff-attendance.service';
import { StaffAttendanceResolver } from './staff-attendance.resolver';

@Module({
  providers: [StaffAttendanceService, StaffAttendanceResolver],
})
export class StaffAttendanceModule {}