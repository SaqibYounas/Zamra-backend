import { Controller, UseGuards, Post, Get, Body } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CompanyServices } from './company.service';
import { companyDto } from './dto/company.dto';
import { ApiResponse } from '@app-types/types';
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
