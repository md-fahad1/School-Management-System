import { Module } from '@nestjs/common';
import { TeacherAttendanceService } from './teacher-attendance.service';
import { TeacherAttendanceResolver } from './teacher-attendance.resolver';

@Module({
  providers: [TeacherAttendanceService, TeacherAttendanceResolver],
})
export class TeacherAttendanceModule {}