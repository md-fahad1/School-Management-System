import { Module } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { ClassesResolver } from './classes.resolver';

@Module({
  providers: [ClassesService, ClassesResolver],
})
export class ClassesModule {}
