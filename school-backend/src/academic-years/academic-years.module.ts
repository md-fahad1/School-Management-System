import { Module } from '@nestjs/common';
import { AcademicYearsService } from './academic-years.service';
import { AcademicYearsResolver } from './academic-years.resolver';

@Module({
  providers: [AcademicYearsService, AcademicYearsResolver],
})
export class AcademicYearsModule {}