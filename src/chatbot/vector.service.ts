import { Injectable, OnModuleInit } from '@nestjs/common';
import { QdrantVectorStore } from '@langchain/qdrant';
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf';
import { Document } from '@langchain/core/documents';

@Injectable()
export class VectorService implements OnModuleInit {
  private vectorStore: QdrantVectorStore | undefined;

  async onModuleInit() {
    try {
      if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
        console.warn(
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
      console.error('Vector service initialization failed:', error);
    }
  }

  // Used by the Ingestion Pipeline
  async addDocuments(documents: Document[]): Promise<void> {
    if (!this.vectorStore) {
      console.warn('Vector store is not ready; skipping document upload.');
      return;
    }

    await this.vectorStore.addDocuments(documents);
  }

  // Used by the Retrieval Pipeline
  async similaritySearch(query: string, k = 3): Promise<Document[]> {
    if (!this.vectorStore) {
      return [];
    }

    return await this.vectorStore.similaritySearch(query, k);
  }
}
