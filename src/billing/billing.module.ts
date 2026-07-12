import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { BillingRepositoryService } from './billing.repository.service';
import { Invoice } from './invoice.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Customer } from './customer.entity';
import { ShippingAddress } from './shipping.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, InvoiceItem, Customer, ShippingAddress]),
    AuthModule,
  ],
  controllers: [BillingController],
  providers: [BillingService, BillingRepositoryService],
})
export class BillingModule {}
