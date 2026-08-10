import { Injectable } from '@nestjs/common';
import { VectorService } from './vector.service';
import { ChatGroq } from '@langchain/groq';
import { buildRagPrompt } from '../prompts/rag.prompt';

@Injectable()
export class RagService {
  private llm: ChatGroq;

  constructor(private readonly vectorService: VectorService) {
    this.llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
    });
  }

  async answerQuery(userQuery: string): Promise<string> {
    const relevantDocs = await this.vectorService.similaritySearch(
      userQuery,
      5,
    );
    const context = relevantDocs
      .map((doc: { pageContent: any }) => doc.pageContent)
      .join('\n\n');

    if (!context || context.trim().length < 20) {
      return 'No relevant product information found.';
    }

    const prompt = buildRagPrompt(context, userQuery);
    const response = await this.llm.invoke(prompt);
    return response.content as string;
  }
}
