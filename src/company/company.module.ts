import { Module } from '@nestjs/common';
import { CompanyServices } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { CompanyRepositoryService } from './company.repository.service';

@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  providers: [CompanyServices, CompanyRepositoryService],
  controllers: [CompanyController],
})
export class CompanyModule {}
