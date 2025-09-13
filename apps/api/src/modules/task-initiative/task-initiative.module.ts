import { Module } from '@nestjs/common';
import { TaskInitiativeService } from './task-initiative.service';
import { TaskInitiativeController } from './task-initiative.controller';
import { PrismaModule } from '../../shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TaskInitiativeController],
  providers: [TaskInitiativeService],
  exports: [TaskInitiativeService],
})
export class TaskInitiativeModule {}
