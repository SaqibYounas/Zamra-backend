import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { VectorService } from './services/vector.service';
import { SyncService } from './services/sync.service';
import { RagService } from './services/rag.service';
import { RagController } from './controllers/rag.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [RagController],
  providers: [VectorService, SyncService, RagService],
})
export class RagModule {}
