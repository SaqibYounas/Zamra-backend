import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateInvoiceDto } from './dto/billing.dto';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('/')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @UseGuards(AuthGuard)
  @Post('invoice/create')
  async createInvoice(@Body() billingData: CreateInvoiceDto) {
    return this.billingService.createInvoice(billingData);
  }

  @UseGuards(AuthGuard)
  @Get('customers')
  async getCustomers() {
    return this.billingService.getAllCustomers();
  }

  @UseGuards(AuthGuard)
  @Get('shipping-addresses')
  async getShippingAddresses() {
    return this.billingService.getAllShippingAddresses();
  }
}
