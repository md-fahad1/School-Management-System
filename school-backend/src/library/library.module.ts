import { Module } from '@nestjs/common';
import { LibraryService } from './library.service';
import { LibraryResolver } from './library.resolver';

@Module({
  providers: [LibraryService, LibraryResolver],
})
export class LibraryModule {}