import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsResolver } from './lessons.resolver';

@Module({
  providers: [LessonsService, LessonsResolver],
})
export class LessonsModule {}
