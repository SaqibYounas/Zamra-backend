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

  async insertInvoice(invoiceData: any): Promise<Invoice> {
    const customer = await this.findCustomerById(invoiceData.customerId);
    const shippingAddress = invoiceData.shippingAddressId
      ? await this.findShippingAddressById(invoiceData.shippingAddressId)
      : undefined;

    const items = invoiceData.items?.map((item: any) =>
      this.invoiceItemRepository.create(item),
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const invoiceEntity = this.invoiceRepository.create({
      ...invoiceData,
      customer,
      shippingAddress,
      items,
    });

    const savedInvoice = (await this.invoiceRepository.save(
      invoiceEntity,
    )) as unknown as Invoice;

    return savedInvoice;
  }

  async createCustomer(customerData: Partial<Customer>): Promise<Customer> {
    const newCustomer = this.customerRepository.create(customerData);
    return await this.customerRepository.save(newCustomer);
  }

  async createShippingAddress(
    shippingData: Partial<ShippingAddress>,
  ): Promise<ShippingAddress> {
    const newShipping = this.shippingRepository.create(shippingData);
    return await this.shippingRepository.save(newShipping);
  }

  async findCustomerByEmail(email: string): Promise<Customer | null> {
    return await this.customerRepository.findOne({ where: { email } as any });
  }

  async findShippingAddressByPhone(
    phone: string,
  ): Promise<ShippingAddress | null> {
    return await this.shippingRepository.findOne({ where: { phone } as any });
  }

  async findCustomerById(customerId: number): Promise<Customer> {
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

  async getAllCustomers(): Promise<Customer[]> {
    return this.customerRepository.find();
  }

  async getAllShipping(): Promise<ShippingAddress[]> {
    return this.shippingRepository.find();
  }

  async findShippingAddressById(
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
