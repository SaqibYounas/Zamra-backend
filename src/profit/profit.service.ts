import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InvoiceItem } from 'src/billing/invoice-item.entity';
import { PriceManagement } from 'src/price-management/priceManagement.entity';

@Injectable()
export class ProfitService {
  constructor(
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
  ) {}

  async getMonthlyProfitReport() {
    const to = new Date();

    const from = new Date();
    from.setDate(from.getDate() - 30);

    const report = await this.invoiceItemRepository
      .createQueryBuilder('item')
      .innerJoin(
        PriceManagement,
        'pm',
        `
        pm.id = (
          SELECT pm2.id
              FROM price_management pm2
                WHERE pm2."bottleType" = item."bottle_type"
              AND pm2."createdAt" <= item."created_at"
              ORDER BY pm2."createdAt" DESC
          LIMIT 1
        )
        `,
      )
      .select('DATE(item."created_at")', 'date')
      .addSelect('SUM(item.qty)', 'soldQty')
      .addSelect('SUM(item.qty * item.rate)', 'revenue')
      .addSelect(
        `
        SUM(
          item.qty *
          (
            COALESCE(pm."perBottlePrice", 0) +
            COALESCE(pm."labelCapPrice", 0) +
            COALESCE(pm."otherExpenses", 0)
          )
        )
        `,
        'cost',
      )
      .addSelect(
        `
        SUM(
          (item.qty * item.rate)
          -
          (
            item.qty *
            (
              COALESCE(pm."perBottlePrice", 0) +
              COALESCE(pm."labelCapPrice", 0) +
              COALESCE(pm."otherExpenses", 0)
            )
          )
        )
        `,
        'profit',
      )
      .where('item."created_at" BETWEEN :from AND :to', {
        from,
        to,
      })
      .groupBy('DATE(item."created_at")')
      .orderBy('DATE(item."created_at")', 'ASC')
      .getRawMany();

    const totalRevenue = report.reduce(
      (sum, row) => sum + Number(row.revenue || 0),
      0,
    );

    const totalCost = report.reduce(
      (sum, row) => sum + Number(row.cost || 0),
      0,
    );

    const totalProfit = report.reduce(
      (sum, row) => sum + Number(row.profit || 0),
      0,
    );

    const monthlyProfitHistory = Array(30).fill(0);

    report.forEach((row) => {
      const dayIndex = Math.floor(
        (new Date(row.date).getTime() - from.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (dayIndex >= 0 && dayIndex < 30) {
        monthlyProfitHistory[dayIndex] = Number(row.profit || 0);
      }
    });

    return {
      totalRevenue,
      totalCost,
      totalProfit,
      monthlyProfitHistory,
      details: report,
    };
  }
}
