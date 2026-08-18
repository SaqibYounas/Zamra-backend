import { Injectable, HttpStatus, NotFoundException } from '@nestjs/common';
import { BillingRepositoryService } from './billing.repository.service';
import { ApiResponse } from '@app-types/types';
import { Invoice } from './invoice.entity';
import { Customer } from './customer.entity';
import { ShippingAddress } from './shipping.entity';

interface CreateInvoiceItemType {
  itemCode: string;
  description: string;
  qty: number;
  rate: number;
  sortOrder: number;
  bottleType?: string;
}

interface CreateCustomerType {
  companyName: string;
  attentionPoc: string;
  mailingAddress: string;
  city: string;
  email: string;
  phone: string;
}

interface CreateShippingType {
  warehouseName: string;
  attentionTo: string;
  phone: string;
  deliveryAddress: string;
}

interface CreateInvoiceType {
  invoiceNo: string;
  customerId?: number;
  customer?: CreateCustomerType;
  shippingAddressId?: number;
  shippingAddress?: CreateShippingType;
  poNo: string;
  shipVia: string;
  rep: string;
  fob: string;
  terms: string;
  dispatchDate: string;
  taxRate: number;
  shippingCharges: number;
  miscCharges: number;
  previousDueArrears: number;
  amountPaid: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  balanceDue: number;
  items: CreateInvoiceItemType[];
}

@Injectable()
export class BillingService {
  constructor(private readonly billingRepository: BillingRepositoryService) {}

  async createInvoice(invoiceData: CreateInvoiceType): Promise<ApiResponse> {
    let customerId = invoiceData.customerId;

    if (!customerId && invoiceData.customer) {
      const customerFind = await this.billingRepository.findCustomerByEmail(
        invoiceData.customer.email,
      );

      if (!customerFind) {
        const createCustomer = await this.billingRepository.createCustomer(
          invoiceData.customer,
        );
        customerId = createCustomer.id;
      } else {
        customerId = customerFind.id;
      }
    }

    let shippingAddressId = invoiceData.shippingAddressId;

    if (!shippingAddressId && invoiceData.shippingAddress) {
      const shippingFind =
        await this.billingRepository.findShippingAddressByPhone(
          invoiceData.shippingAddress.phone,
        );

      if (!shippingFind) {
        const createShipping =
          await this.billingRepository.createShippingAddress(
            invoiceData.shippingAddress,
          );
        shippingAddressId = createShipping.id;
      } else {
        shippingAddressId = shippingFind.id;
      }
    }

    const invoice = await this.billingRepository.insertInvoice({
      ...invoiceData,
      customerId,
      shippingAddressId,
    });

    return {
      status: HttpStatus.OK,
      message: 'Invoice created successfully',
      data: invoice,
    };
  }
  async getInvoiceById(id: number): Promise<Invoice> {
    const invoice = await this.billingRepository.getInvoiceById(id);

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found.`);
    }

    return invoice;
  }
  async getAllInvoices(): Promise<ApiResponse> {
    const bills = await this.billingRepository.getAllInvoicesBuilder();
    return {
      status: HttpStatus.OK,
      message: 'All Invoices fetched successfully',
      data: bills,
    };
  }

  async updateInvoiceById(
    id: number,
    updateData: Partial<Invoice>,
  ): Promise<ApiResponse> {
    const billUpdate = await this.billingRepository.updateInvoice(
      id,
      updateData,
    );
    return {
      status: HttpStatus.OK,
      message: 'Invoice updated successfully',
      data: billUpdate,
    };
  }

  async deleteInvoiceById(id: number): Promise<ApiResponse> {
    const response = await this.billingRepository.deleteInvoiceWithBuilder(id);
    return {
      status: HttpStatus.OK,
      message: response.message,
      data: null,
    };
  }

  // ================= CUSTOMER METHODS =================

  async getAllCustomers(page: number = 1): Promise<ApiResponse> {
    const customers = await this.billingRepository.getAllCustomers(page);
    return {
      status: HttpStatus.OK,
      message: 'Customers fetched successfully',
      data: customers,
    };
  }

  async updateCustomerById(
    id: number,
    updateData: Partial<Customer>,
  ): Promise<ApiResponse> {
    const customer = await this.billingRepository.updateCustomer(
      id,
      updateData,
    );
    return {
      status: HttpStatus.OK,
      message: 'Customer updated successfully',
      data: customer,
    };
  }

  async deleteCustomerById(id: number): Promise<ApiResponse> {
    const response = await this.billingRepository.deleteCustomer(id);
    return {
      status: HttpStatus.OK,
      message: response.message,
      data: null,
    };
  }

  // ================= SHIPPING ADDRESS METHODS =================

  async getAllShippingAddresses(page: number = 1): Promise<ApiResponse> {
    const shippingAddresses = await this.billingRepository.getAllShipping(page);
    return {
      status: HttpStatus.OK,
      message: 'Shipping Addresses fetched successfully',
      data: shippingAddresses,
    };
  }

  async updateShippingAddressById(
    id: number,
    shippingData: Partial<ShippingAddress>,
  ): Promise<ApiResponse> {
    const shippingAddress = await this.billingRepository.updateShippingAddress(
      id,
      shippingData,
    );
    return {
      status: HttpStatus.OK,
      message: 'Shipping address updated successfully',
      data: shippingAddress,
    };
  }

  async deleteShippingAddressById(id: number): Promise<ApiResponse> {
    const response = await this.billingRepository.deleteShippingAddress(id);
    return {
      status: HttpStatus.OK,
      message: response.message,
      data: null,
    };
  }
}
