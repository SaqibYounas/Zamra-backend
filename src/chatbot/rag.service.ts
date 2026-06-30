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
      3,
    );
    // 2. Synthesize context fragments
    const context = relevantDocs
      .map((doc: { pageContent: any }) => doc.pageContent)
      .join('\n\n');

    if (!context) {
      return 'I could not find any relevant information in the knowledge base to answer your question.';
    }

    // 3. Build a structured systemic prompt boundaries
    const prompt = `
      You are an assistant answering questions based strictly on the knowledge context below.
      If the answer cannot be found directly in the text provided, respond with: "I do not know". Do not speculate.

      Context:
      ${context}

      Question: ${userQuery}
      Answer:
    `;

    // 4. Return plaintext inference completion back to the client controller
    const response = await this.llm.invoke(prompt);
    return response.content as string;
  }
}
