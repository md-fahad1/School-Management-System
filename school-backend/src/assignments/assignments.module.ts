import { Module } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AssignmentsResolver } from './assignments.resolver';

@Module({
  providers: [AssignmentsService, AssignmentsResolver],
})
export class AssignmentsModule {}
