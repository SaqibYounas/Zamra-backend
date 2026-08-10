import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { VectorService } from './vector.service';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import { Client } from 'pg';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private readonly vectorService: VectorService) {}

  @Cron('0 */6 * * *')
  async handleSixHourSync() {
    this.logger.log(
      'Ingestion Pipeline Triggered: Fetching NeonDB changes from the last 6 hours...',
    );

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();

    const tablesToIndex = [
      'company',
      'daily_stock',
      'price_management',
      'articles',
    ];

    const rawData: { table: string; rows: any[] }[] = [];

    for (const table of tablesToIndex) {
      try {
        let res;
        try {
          res = await client.query(
            `SELECT * FROM ${table} WHERE updated_at >= NOW() - INTERVAL '6 hours'`,
          );
        } catch {
          try {
            res = await client.query(
              `SELECT * FROM ${table} WHERE "updatedAt" >= NOW() - INTERVAL '6 hours'`,
            );
          } catch {
            res = await client.query(`SELECT * FROM ${table}`);
          }
        }

        rawData.push({ table, rows: res.rows });
      } catch (err) {
        this.logger.warn(
          `Failed to query table ${table}: ${
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            err instanceof Error ? err.message : err
          }`,
        );
      }
    }

    await client.end();

    const rowsToProcess: { table: string; row: any }[] = [];
    const SIX_HOURS_AGO = Date.now() - 6 * 60 * 60 * 1000;

    for (const batch of rawData) {
      for (const row of batch.rows) {
        const updated = row.updated_at ?? row.updatedAt ?? row.updatedAt;
        if (updated) {
          const updatedTime = new Date(updated).getTime();
          if (updatedTime >= SIX_HOURS_AGO) {
            rowsToProcess.push({ table: batch.table, row });
          }
        } else {
          rowsToProcess.push({ table: batch.table, row });
        }
      }
    }

    if (rowsToProcess.length === 0) {
      this.logger.log(
        'Ingestion Pipeline: No new or updated data modifications found.',
      );
      return;
    }

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });

    const docsToUpload: Document[] = [];

    for (const item of rowsToProcess) {
      const row = item.row;
      const parts: string[] = [];
      for (const key of Object.keys(row)) {
        if (key.toLowerCase().includes('password')) continue;
        const value = row[key];
        const valueStr =
          typeof value === 'object' ? JSON.stringify(value) : String(value);
        parts.push(`${key}: ${valueStr}`);
      }

      const fullText = parts.join('\n');
      const chunks = await textSplitter.splitText(fullText);

      for (const chunk of chunks) {
        docsToUpload.push(
          new Document({
            pageContent: chunk,
            metadata: {
              originalId: row.id ?? row.ID ?? null,
              source: item.table,
              timestamp: row.updated_at ?? row.updatedAt ?? null,
            },
          }),
        );
      }
    }

    if (docsToUpload.length > 0) {
      await this.vectorService.addDocuments(docsToUpload);
      this.logger.log(
        `Ingestion Complete: Successfully updated Qdrant with ${docsToUpload.length} new chunks.`,
      );
    }
  }
}
