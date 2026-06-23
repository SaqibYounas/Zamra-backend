import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { CompanyRepositoryService } from './company.service';
@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  controllers: [],
  providers: [CompanyRepositoryService],
  exports: [CompanyRepositoryService],
})
export class CompanyRepositoryModule {}
