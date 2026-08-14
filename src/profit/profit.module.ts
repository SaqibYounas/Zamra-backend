import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProfitController } from './profit.controller';
import { ProfitService } from './profit.service';
import { InvoiceItem } from 'src/billing/invoice-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceItem])],
  controllers: [ProfitController],
  providers: [ProfitService],
})
export class ProfitModule {}
