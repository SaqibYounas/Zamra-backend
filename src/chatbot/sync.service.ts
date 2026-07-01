import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { VectorService } from './vector.service';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import { Client } from 'pg';

@Injectable()
export class SyncService {
  constructor(private readonly vectorService: VectorService) {}

  @Cron('0 */6 * * *')
  async handleSixHourSync() {
    console.log(
      'Ingestion Pipeline Triggered: Fetching NeonDB changes from the last 6 hours...',
    );

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();

    // Tables to index (exclude `users` by default). Add or remove names as needed.
    const tablesToIndex = [
      'company',
      'daily_stock',
      'price_management',
      'articles',
    ];

    const rawData: { table: string; rows: any[] }[] = [];

    for (const table of tablesToIndex) {
      try {
        // Prefer `updated_at`, fall back to `updatedAt` or fetch all rows if neither column exists
        let res;
        try {
          res = await client.query(
            `SELECT * FROM ${table} WHERE updated_at >= NOW() - INTERVAL '6 hours'`,
          );
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          try {
            res = await client.query(
              `SELECT * FROM ${table} WHERE "updatedAt" >= NOW() - INTERVAL '6 hours'`,
            );
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e2) {
            // If both queries fail (no such column), fetch all rows and filter in JS
            res = await client.query(`SELECT * FROM ${table}`);
          }
        }

        rawData.push({ table, rows: res.rows });
      } catch (err) {
        console.warn(
          `Failed to query table ${table}:`,
          err instanceof Error ? err.message : err,
        );
      }
    }
    await client.end();

    // Flatten rows and filter by update timestamp in JS when needed
    const rowsToProcess: { table: string; row: any }[] = [];
    const SIX_HOURS_AGO = Date.now() - 6 * 60 * 60 * 1000;

    for (const batch of rawData) {
      for (const row of batch.rows) {
        const updated = row.updated_at ?? row.updatedAt ?? row.updatedAt;
        if (updated) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          const updatedTime = new Date(updated).getTime();
          if (updatedTime >= SIX_HOURS_AGO) {
            rowsToProcess.push({ table: batch.table, row });
          }
        } else {
          // If no timestamp column, include by default
          rowsToProcess.push({ table: batch.table, row });
        }
      }
    }

    if (rowsToProcess.length === 0) {
      console.log(
        'Ingestion Pipeline: No new or updated data modifications found.',
      );
      return;
    }

    // Initialize character splitter setup
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });

    const docsToUpload: Document[] = [];

    for (const item of rowsToProcess) {
      const row = item.row;
      // Build a readable text representation from all fields, skipping sensitive fields
      const parts: string[] = [];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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

    // Upload generated chunks into Qdrant Cloud
    if (docsToUpload.length > 0) {
      await this.vectorService.addDocuments(docsToUpload);
      console.log(
        `Ingestion Complete: Successfully updated Qdrant with ${docsToUpload.length} new chunks.`,
      );
    }
  }
}
