import { Injectable, OnModuleInit } from '@nestjs/common';
import { QdrantVectorStore } from '@langchain/qdrant';
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf';
import { Document } from '@langchain/core/documents';

@Injectable()
export class VectorService implements OnModuleInit {
  onModuleInit() {
    throw new Error('Method not implemented.');
  }

  private vectorStore: QdrantVectorStore | undefined;

  async OnModuleInit() {
    const embeddings = new HuggingFaceInferenceEmbeddings({
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
  }

  // Used by the Ingestion Pipeline
  async addDocuments(documents: Document[]): Promise<void> {
    await this.vectorStore!.addDocuments(documents);
  }

  // Used by the Retrieval Pipeline
  async similaritySearch(query: string, k = 3): Promise<Document[]> {
    return await this.vectorStore!.similaritySearch(query, k);
  }
}
