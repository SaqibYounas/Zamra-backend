import { Module } from '@nestjs/common';
import { PriceManagementController } from './price-management.controller';
import { PriceManagementService } from './price-management.service';

@Module({
  controllers: [PriceManagementController],
  providers: [PriceManagementService],
})
export class PriceManagementModule {}
