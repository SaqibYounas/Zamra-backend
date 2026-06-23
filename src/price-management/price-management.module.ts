import { Module } from '@nestjs/common';
import { PriceManagementController } from './price-management.controller';
import { PriceManagementService } from './price-management.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceManagement } from './priceManagement.entity';
@Module({
  imports: [TypeOrmModule.forFeature([PriceManagement])],
  controllers: [PriceManagementController],
  providers: [PriceManagementService],
})
export class PriceManagementModule {}
