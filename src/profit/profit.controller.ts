import { Controller, Get } from '@nestjs/common';
import { ProfitService } from './profit.service';

@Controller('profit')
export class ProfitController {
  constructor(private readonly profitService: ProfitService) {}

  @Get()
  async getProfit() {
    return this.profitService.getProfit();
  }
}
