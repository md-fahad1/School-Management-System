import { Module } from '@nestjs/common';
import { GradesService } from './grades.service';
import { GradesResolver } from './grades.resolver';

@Module({
  providers: [GradesService, GradesResolver],
})
export class GradesModule {}
