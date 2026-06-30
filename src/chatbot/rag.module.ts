import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { VectorService } from './vector.service';
import { SyncService } from './sync.service';
import { RagService } from './rag.service';
import { RagController } from './rag.controller';

@Module({
  Imports: [ScheduleModule.forRoot()],
  Controllers: [RagController],
  Providers: [VectorService, SyncService, RagService],
})
export class RagModule {}
