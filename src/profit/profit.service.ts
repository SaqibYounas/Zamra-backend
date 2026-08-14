import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

interface ProfitReportRow {
  report_date: string | Date;
  sold_qty: string | number;
  revenue: string | number;
  cost: string | number;
  profit: string | number;
}

@Injectable()
export class ProfitService {
  constructor(private readonly dataSource: DataSource) {}

  async getMonthlyProfitReport() {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let rawReport: ProfitReportRow[] = [];

    try {
      await queryRunner.query(
        `CALL get_monthly_profit_report_proc($1, $2, 'profit_cur');`,
        [from, to],
      );

      rawReport = await queryRunner.query(`FETCH ALL FROM "profit_cur";`);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    // Data Transformation
    const report = rawReport.map((row) => ({
      date: row.report_date,
      soldQty: Number(row.sold_qty || 0),
      revenue: Number(row.revenue || 0),
      cost: Number(row.cost || 0),
      profit: Number(row.profit || 0),
    }));

    const totalRevenue = report.reduce((sum, row) => sum + row.revenue, 0);
    const totalCost = report.reduce((sum, row) => sum + row.cost, 0);
    const totalProfit = report.reduce((sum, row) => sum + row.profit, 0);

    const monthlyProfitHistory = Array(30).fill(0);

    report.forEach((row) => {
      const dayIndex = Math.floor(
        (new Date(row.date).getTime() - from.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (dayIndex >= 0 && dayIndex < 30) {
        monthlyProfitHistory[dayIndex] = row.profit;
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
