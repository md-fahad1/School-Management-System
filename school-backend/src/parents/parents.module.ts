import { Module } from '@nestjs/common';
import { ParentsService } from './parents.service';
import { ParentsResolver } from './parents.resolver';

@Module({
  providers: [ParentsService, ParentsResolver],
})
export class ParentsModule {}
