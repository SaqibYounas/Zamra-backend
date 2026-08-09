import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { RagService } from '../services/rag.service';
import { QueryDto } from '../dto/query.dto';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('query')
  async handleUserQuery(@Body() body: QueryDto) {
    if (!body?.question) {
      throw new BadRequestException(
        'The payload body must include a "question" property.',
      );
    }

    const answer = await this.ragService.answerQuery(body.question);
    console.log(answer);

    return { answer };
  }
}
