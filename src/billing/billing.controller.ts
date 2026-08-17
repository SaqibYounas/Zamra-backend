import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Put,
  Delete,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateInvoiceDto } from './dto/billing.dto';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Invoice } from './invoice.entity';
import { Customer } from './customer.entity';
import { ShippingAddress } from './shipping.entity';

@Controller('/')
@UseGuards(AuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // ================= INVOICE ROUTES =================

  @Post('invoice/create')
  async createInvoice(@Body() billingData: CreateInvoiceDto) {
    return this.billingService.createInvoice(billingData);
  }

  @Get('bills')
  async getInvoices() {
    return this.billingService.getAllInvoices();
  }

  @Put('invoice/:id')
  async updateInvoice(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<Invoice>,
  ) {
    return this.billingService.updateInvoiceById(id, updateData);
  }

  @Delete('invoice/:id')
  async deleteInvoice(@Param('id', ParseIntPipe) id: number) {
    return this.billingService.deleteInvoiceById(id);
  }

  // ================= CUSTOMER ROUTES =================

  @Get('customers')
  async getCustomers(@Query('page') page: string = '1') {
    const pageNumber = parseInt(page, 10) || 1;
    return this.billingService.getAllCustomers(pageNumber);
  }

  @Put('customer/:id')
  async updateCustomer(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<Customer>,
  ) {
    return this.billingService.updateCustomerById(id, updateData);
  }

  @Delete('customer/:id')
  async deleteCustomer(@Param('id', ParseIntPipe) id: number) {
    return this.billingService.deleteCustomerById(id);
  }

  // ================= SHIPPING ADDRESS ROUTES =================

  @Get('shipping-addresses')
  async getShippingAddresses(@Query('page') page: string = '1') {
    const pageNumber = parseInt(page, 10) || 1;
    return this.billingService.getAllShippingAddresses(pageNumber);
  }

  @Put('shipping-address/:id')
  async updateShippingAddress(
    @Param('id', ParseIntPipe) id: number,
    @Body() shippingData: Partial<ShippingAddress>,
  ) {
    return this.billingService.updateShippingAddressById(id, shippingData);
  }

  @Delete('shipping-address/:id')
  async deleteShippingAddress(@Param('id', ParseIntPipe) id: number) {
    return this.billingService.deleteShippingAddressById(id);
  }
}
