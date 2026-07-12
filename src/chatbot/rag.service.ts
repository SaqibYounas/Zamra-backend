import { Injectable } from '@nestjs/common';
import { VectorService } from './vector.service';
import { ChatGroq } from '@langchain/groq';

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

    const prompt = `
    You are a helpful assistant.

  Rules:
- Answer ONLY from the provided Context.
- Do NOT use your own knowledge.
- If the answer is not clearly present in the Context, reply exactly:
  "I don't know based on the provided information."
- Give SHORT and DIRECT answers only.
- Respond in 1–2 sentences maximum.
- Do NOT make assumptions or guess.
- Do NOT invent facts, prices, policies, or details.
- Be natural and user-friendly.

Context:
${context}

Question:
${userQuery}
`;
    const response = await this.llm.invoke(prompt);
    return response.content as string;
  }
}
