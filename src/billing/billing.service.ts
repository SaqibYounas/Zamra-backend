import { Injectable, HttpStatus } from '@nestjs/common';
import { BillingRepositoryService } from './billing.repository.service';
import { ApiResponse } from '@app-types/types';

interface CreateInvoiceItemType {
  itemCode: string;
  description: string;
  qty: number;
  rate: number;
  sortOrder: number;
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

  async getAllCustomers(): Promise<ApiResponse> {
    const customers = await this.billingRepository.getAllCustomers();

    return {
      status: HttpStatus.OK,
      message: 'Customers fetched successfully',
      data: customers,
    };
  }
  async getAllShippingAddresses(): Promise<ApiResponse> {
    const shippingAddresses = await this.billingRepository.getAllShipping();
    return {
      status: HttpStatus.OK,
      message: 'Shipping Addresses fetched successfully',
      data: shippingAddresses,
    };
  }
}
