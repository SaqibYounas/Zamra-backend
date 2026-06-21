import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceManagement } from './priceManagement.entity';
import { PriceManagementService } from './priceManagement.service';
@Module({
  imports: [TypeOrmModule.forFeature([PriceManagement])],
  controllers: [],
  providers: [PriceManagementService],
  exports: [PriceManagementService],
})
export class PriceManagementModule {}
