import { Module } from '@nestjs/common';
import { InstitutionsService } from './institutions.service';
import { InstitutionsResolver } from './institutions.resolver';

@Module({
  providers: [InstitutionsService, InstitutionsResolver],
})
export class InstitutionsModule {}