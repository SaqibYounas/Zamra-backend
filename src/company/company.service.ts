import { Injectable, HttpStatus } from '@nestjs/common';
import { CompanyRepositoryService } from 'src/company/company.repository.service';
import { COMPANY_MESSAGES } from 'src/common/constants/messages.constant';
import { ApiResponse } from '@app-types/types';

interface CompanyPayload {
  name: string;
  owner: string;
  address: string;
  city: string;
  contact: number;
  email: string;
}

@Injectable()
export class CompanyServices {
  constructor(private readonly companyService: CompanyRepositoryService) {}

  async insertCompany(companyInfo: CompanyPayload): Promise<ApiResponse> {
    const companyData = await this.companyService.createCompany(companyInfo);

    return {
      status: HttpStatus.CREATED,
      message: COMPANY_MESSAGES.SUCCESS.REGISTERED,
      data: companyData,
    };
  }

  async fetchCompany(): Promise<ApiResponse> {
    const companies = await this.companyService.findAll();

    return {
      status: HttpStatus.OK,
      message: COMPANY_MESSAGES.SUCCESS.FETCHED,
      data: companies,
    };
  }
}
