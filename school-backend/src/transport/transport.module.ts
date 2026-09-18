import { Module } from '@nestjs/common';
import { TransportService } from './transport.service';
import { TransportResolver } from './transport.resolver';

@Module({
  providers: [TransportService, TransportResolver],
})
export class TransportModule {}