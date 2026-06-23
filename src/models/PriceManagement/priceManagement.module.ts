import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceManagement } from './priceManagement.entity';
import { PriceManagementRepositoryService } from './priceManagement.service';
@Module({
  imports: [TypeOrmModule.forFeature([PriceManagement])],
  controllers: [],
  providers: [PriceManagementRepositoryService],
  exports: [PriceManagementRepositoryService],
})
export class PriceManagementModule {}
