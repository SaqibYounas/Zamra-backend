import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateInvoiceDto } from './dto/billing.dto';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @UseGuards(AuthGuard)
  @Post('/create')
  async createBill(@Body() billingData: CreateInvoiceDto) {
    return this.billingService.createInvoice(billingData);
  }
}
