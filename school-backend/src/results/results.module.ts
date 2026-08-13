import { Module } from '@nestjs/common';
import { ResultsService } from './results.service';
import { ResultsResolver } from './results.resolver';

@Module({
  providers: [ResultsService, ResultsResolver],
})
export class ResultsModule {}
