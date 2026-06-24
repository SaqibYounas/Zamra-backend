import { Module } from '@nestjs/common';
import { PriceManagementController } from './price-management.controller';
import { PriceManagementService } from './price-management.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceManagement } from './priceManagement.entity';
import { PriceManagementRepositoryService } from './priceManagement.repository.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([PriceManagement]), AuthModule],
  controllers: [PriceManagementController],
  providers: [PriceManagementService, PriceManagementRepositoryService],
})
export class PriceManagementModule {}
