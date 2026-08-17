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

  async getAllInvoicesBuilder(): Promise<Invoice[]> {
    return await this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.items', 'items')
      .leftJoin('invoice.customer', 'customer')
      .addSelect(['customer.id', 'customer.name', 'customer.email'])
      .leftJoinAndSelect('invoice.shippingAddress', 'shippingAddress')
      .orderBy('invoice.id', 'DESC')
      .getMany();
  }

  async updateInvoice(
    id: number,
    updateData: Partial<Invoice>,
  ): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id } as any,
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found.`);
    }

    Object.assign(invoice, updateData);
    return await this.invoiceRepository.save(invoice);
  }

  async deleteInvoiceWithBuilder(id: number): Promise<{ message: string }> {
    const result = await this.invoiceRepository
      .createQueryBuilder()
      .delete()
      .from(Invoice)
      .where('id = :id', { id })
      .execute();

    if (result.affected === 0) {
      throw new NotFoundException(`Invoice with ID ${id} not found.`);
    }

    return { message: `Invoice #${id} successfully deleted.` };
  }

  async findCustomerByEmail(email: string): Promise<Customer | null> {
    return await this.customerRepository.findOne({ where: { email } as any });
  }

  async updateCustomer(
    id: number,
    updateData: Partial<Customer>,
  ): Promise<Customer> {
    const customer = await this.findCustomerById(id);

    Object.assign(customer, updateData);
    return await this.customerRepository.save(customer);
  }

  async deleteCustomer(id: number): Promise<{ message: string }> {
    const result = await this.customerRepository
      .createQueryBuilder()
      .delete()
      .from(Customer)
      .where('id = :id', { id })
      .execute();

    if (result.affected === 0) {
      throw new NotFoundException(`Customer with ID ${id} not found.`);
    }

    return { message: `Customer #${id} successfully deleted.` };
  }

  async updateShippingAddress(
    id: number,
    shippingData: Partial<ShippingAddress>,
  ): Promise<ShippingAddress> {
    const shippingAddress = await this.findShippingAddressById(id);

    Object.assign(shippingAddress, shippingData);
    return await this.shippingRepository.save(shippingAddress);
  }

  async deleteShippingAddress(id: number): Promise<{ message: string }> {
    const result = await this.shippingRepository
      .createQueryBuilder()
      .delete()
      .from(ShippingAddress)
      .where('id = :id', { id })
      .execute();

    if (result.affected === 0) {
      throw new NotFoundException(`Shipping address with ID ${id} not found.`);
    }

    return { message: `Shipping address #${id} successfully deleted.` };
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

  async getAllCustomers(page: number = 1): Promise<Customer[]> {
    const limit = 10;
    const skip = (page - 1) * limit;

    return this.customerRepository.find({
      take: limit,
      skip: skip,
      order: { id: 'DESC' } as any,
    });
  }

  async getAllShipping(page: number = 1): Promise<ShippingAddress[]> {
    const limit = 10;
    const skip = (page - 1) * limit;

    return this.shippingRepository.find({
      take: limit,
      skip: skip,
      order: { id: 'DESC' } as any,
    });
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
