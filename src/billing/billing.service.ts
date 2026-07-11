import { Injectable } from '@nestjs/common';
import { BillingRepositoryService } from './billing.repository.service';
import { Invoice } from './invoice.entity';

@Injectable()
export class BillingService {
  constructor(private readonly billingRepository: BillingRepositoryService) {}

  async createInvoice(invoiceData: Partial<Invoice>): Promise<Invoice> {
    return this.billingRepository.insertInvoice(invoiceData);
  }
}
