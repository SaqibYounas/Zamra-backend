import { Module } from '@nestjs/common';
import { CompanyServices } from './company.service';
import { CompanyController } from './company.controller';

@Module({
  providers: [CompanyServices],
  controllers: [CompanyController],
})
export class CompanyModule {}
