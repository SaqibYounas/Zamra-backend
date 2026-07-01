import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { RagService } from './rag.service';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('query')
  async handleUserQuery(@Body() body: { question: string }) {
    if (!body.question) {
      throw new BadRequestException(
        'The payload body must include a "question" property.',
      );
    }

    const answer = await this.ragService.answerQuery(body.question);
    console.log(answer);

    return { answer };
  }
}
