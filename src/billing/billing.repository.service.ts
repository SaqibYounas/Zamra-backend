import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Customer } from './customer.entity';
import { ShippingAddress } from './shipping.entity';

@Injectable()
export class BillingRepositoryService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(ShippingAddress)
    private readonly shippingRepository: Repository<ShippingAddress>,
  ) {}

  async insertInvoice(invoiceData: Partial<Invoice>): Promise<Invoice> {
    const customer = await this.findCustomer(invoiceData.customer?.id);
    const shippingAddress = invoiceData.shippingAddress?.id
      ? await this.findShippingAddress(invoiceData.shippingAddress.id)
      : undefined;

    const items = invoiceData.items?.map((item) =>
      this.invoiceItemRepository.create(item),
    );

    const invoice = this.invoiceRepository.create({
      ...invoiceData,
      customer,
      shippingAddress,
      items,
    });

    return this.invoiceRepository.save(invoice);
  }

  async createCustomer(customerData: Partial<Customer>): Promise<Customer> {
    const newCustomer = this.customerRepository.create(customerData);
    return await this.customerRepository.save(newCustomer);
  }

  async createShopping(
    shippingDData: Partial<ShippingAddress>,
  ): Promise<ShippingAddress> {
    const newShipping = this.customerRepository.create(shippingDData);
    return await this.shippingRepository.save(newShipping);
  }

  async findCustomer(customerId?: number): Promise<Customer> {
    if (!customerId) {
      throw new NotFoundException(
        'Customer ID is required to create an invoice.',
      );
    }

    const customer = await this.customerRepository.findOne({
      where: { id: customerId } as any,
    });

    if (!customer) {
      throw new NotFoundException(`Customer not found for ID ${customerId}`);
    }

    return customer;
  }

  async findShippingAddress(
    shippingAddressId: number,
  ): Promise<ShippingAddress> {
    const shippingAddress = await this.shippingRepository.findOne({
      where: { id: shippingAddressId } as any,
    });

    if (!shippingAddress) {
      throw new NotFoundException(
        `Shipping address not found for ID ${shippingAddressId}`,
      );
    }

    return shippingAddress;
  }
}
