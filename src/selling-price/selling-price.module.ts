import { Module } from '@nestjs/common';
import { SellingPriceController } from './selling-price.controller';
import { SellingPriceService } from './selling-price.service';

@Module({
  controllers: [SellingPriceController],
  providers: [SellingPriceService],
})
export class SellingPriceModule {}
