import { Injectable } from '@nestjs/common';
import { VectorService } from './vector.service';
import { ChatGroq } from '@langchain/groq';

@Injectable()
export class RagService {
  // Corrected property definition syntax
  private llm: ChatGroq;

  constructor(private readonly vectorService: VectorService) {
    this.llm = new ChatGroq({
      // Corrected to lowercase property names
      apiKey: process.env.GROQ_API_KEY,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
    });
  }

  async answerQuery(userQuery: string): Promise<string> {
    // 1. Query the Qdrant cluster for semantic matches (Fixed trailing comma to semicolon)
    const relevantDocs = await this.vectorService.similaritySearch(
      userQuery,
      5,
    );
    // 2. Synthesize context fragments
    const context = relevantDocs
      .map((doc: { pageContent: any }) => doc.pageContent)
      .join('\n\n');

    if (!context || context.trim().length < 20) {
      return 'No relevant product information found.';
    }

    // 3. Build a structured systemic prompt boundaries
    const prompt = `
You are a helpful assistant.

Rules:
- Give SHORT and DIRECT answers only.
- Do NOT explain step-by-step calculations.
- Do NOT repeat the same information.
- Do NOT add unnecessary sentences like "to find the price" or "we need to look at".
- Always respond in 1–2 sentences maximum.
- Be natural and user-friendly.

Context:
${context}

Question:
${userQuery}

Answer:
`;
    // 4. Return plaintext inference completion back to the client controller
    const response = await this.llm.invoke(prompt);
    return response.content as string;
  }
}
