import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceManagement } from './PriceManagement.entity';
import { PriceManagementService } from './PriceManagement.service';
@Module({
  imports: [TypeOrmModule.forFeature([PriceManagement])],
  controllers: [],
  providers: [PriceManagementService],
  exports: [PriceManagementService],
})
export class CompanyModule {}
