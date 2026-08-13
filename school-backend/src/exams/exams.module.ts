import { Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsResolver } from './exams.resolver';

@Module({
  providers: [ExamsService, ExamsResolver],
})
export class ExamsModule {}
