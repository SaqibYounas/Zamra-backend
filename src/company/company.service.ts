import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CompanyService } from 'src/models/company/company.service';

interface CompanyPayload {
  name: string;
  owner: string;
  address: string;
  city: string;
  contact: number;
  email: string;
}

export interface ApiResponse {
  status: number;
  message?: string;
  data?: any;
}

@Injectable()
export class CompanyServices {
  constructor(private readonly companyService: CompanyService) {}

  async insertCompany(companyInfo: CompanyPayload): Promise<ApiResponse> {
    const companyData = await this.companyService.createCompany(companyInfo);

    if (!companyData) {
      throw new InternalServerErrorException('Failed to register the company.');
    }

    return {
      status: 201,
      message: 'Company was successfully registered',
    };
  }

  async fetchCompany(): Promise<ApiResponse> {
    const companies = await this.companyService.findAll();
    return {
      status: 200,
      data: companies,
    };
  }
}
