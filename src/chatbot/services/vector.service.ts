import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { QdrantVectorStore } from '@langchain/qdrant';
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf';
import { Document } from '@langchain/core/documents';

@Injectable()
export class VectorService implements OnModuleInit {
  private vectorStore: QdrantVectorStore | undefined;
  private readonly logger = new Logger(VectorService.name);

  async onModuleInit() {
    try {
      if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
        this.logger.warn(
          'Qdrant credentials are not configured yet; vector service will stay inactive.',
        );
        return;
      }

      const embeddings = new HuggingFaceInferenceEmbeddings({
        apiKey: process.env.HF_TOKEN,
        model: 'sentence-transformers/all-MiniLM-L6-v2',
      });

      this.vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
          url: process.env.QDRANT_URL,
          apiKey: process.env.QDRANT_API_KEY,
          collectionName: 'zamra_knowledge_base',
        },
      );
    } catch (error) {
      this.logger.error(
        'Vector service initialization failed:',
        error as Error,
      );
    }
  }

  async addDocuments(documents: Document[]): Promise<void> {
    if (!this.vectorStore) {
      this.logger.warn('Vector store is not ready; skipping document upload.');
      return;
    }

    await this.vectorStore.addDocuments(documents);
  }

  async similaritySearch(query: string, k = 3): Promise<Document[]> {
    if (!this.vectorStore) {
      return [];
    }

    return await this.vectorStore.similaritySearch(query, k);
  }
}
