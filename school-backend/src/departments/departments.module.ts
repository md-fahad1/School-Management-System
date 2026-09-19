import { Module } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DepartmentsResolver } from './departments.resolver';

@Module({
  providers: [DepartmentsService, DepartmentsResolver],
})
export class DepartmentsModule {}