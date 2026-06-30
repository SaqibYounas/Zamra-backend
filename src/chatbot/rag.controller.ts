import { Controller, Post, Body, BadRequestException } from '@nestjs/common';

@Controller('rag')
export class RagController {
  ragService: any;
  Constructor() {}

  @Post('query')
  async handleUserQuery(@Body() body: { question: string }) {
    if (!body.question) {
      throw new BadRequestException(
        'The payload body must include a "question" property.',
      );
    }
    const answer = await this.ragService.answerQuery(body.question);
    return { answer };
  }
}
