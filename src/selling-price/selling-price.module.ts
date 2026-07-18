import { Module } from '@nestjs/common';
import { SellingPriceController } from './selling-price.controller';
import { SellingPriceService } from './selling-price.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellingRate } from './selling-price.entity';
import { AuthModule } from 'src/auth/auth.module';
import { SellingRateRepositoryService } from './selling-price.repository.service';
@Module({
  imports: [TypeOrmModule.forFeature([SellingRate]), AuthModule],
  controllers: [SellingPriceController],
  providers: [SellingPriceService, SellingRateRepositoryService],
})
export class SellingPriceModule {}
