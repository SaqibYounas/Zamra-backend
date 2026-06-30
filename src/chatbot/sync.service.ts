import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { VectorService } from './vector.service';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from '@langchain/core/documents';
import { Client } from 'pg';

@Injectable()
export class SyncService {
  // Correctly inject the vector service through the constructor to manage runtime instances
  constructor(private readonly vectorService: VectorService) {}

  // Cron Expression for running exactly once every 6 hours
  @Cron('0 */6 * * *')
  async handleSixHourSync() {
    console.log(
      'Ingestion Pipeline Triggered: Fetching NeonDB changes from the last 6 hours...',
    );

    const client = new Client({
      connectionString: process.env.NEON_DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();

    // Query extracts data records altered or created within the past 6 hours
    const queryText = `
      SELECT id, title, content, updated_at 
      FROM articles 
      WHERE updated_at >= NOW() - INTERVAL '6 hours'
    `;
    const res = await client.query(queryText);
    const rawData = res.rows;
    await client.end();

    if (rawData.length === 0) {
      console.log(
        'Ingestion Pipeline: No new or updated data modifications found.',
      );
      return; // Return early if there's no data to process
    }

    // Initialize character splitter setup
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500, // Enforce lowercase configurations
      chunkOverlap: 50,
    });

    const docsToUpload: Document[] = [];

    for (const item of rawData) {
      const fullText = `Title: ${item.title}\nContent: ${item.content}`;
      const chunks = await textSplitter.splitText(fullText);

      // Fixed casing on "for" and "docsToUpload"
      for (const chunk of chunks) {
        docsToUpload.push(
          // Removed duplicate "new" keyword syntax
          new Document({
            pageContent: chunk,
            metadata: {
              originalId: item.id,
              source: 'neondb_articles',
              timestamp: item.updated_at,
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
