import { Controller, UseGuards, Post, Get, Body } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CompanyServices, ApiResponse } from './company.service';
import { companyDto } from './dto/company.dto';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyServices: CompanyServices) {}

  @UseGuards(AuthGuard)
  @Post('register')
  async createCompany(@Body() payload: companyDto): Promise<ApiResponse> {
    return await this.companyServices.insertCompany(payload);
  }

  @UseGuards(AuthGuard)
  @Get('')
  async fetchCompany(): Promise<ApiResponse> {
    return await this.companyServices.fetchCompany();
  }
}
