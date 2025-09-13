import { Module } from '@nestjs/common';
import { TaskStatusService } from './task-status.service';
import { TaskStatusController } from './task-status.controller';
import { PrismaModule } from '../../shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TaskStatusController],
  providers: [TaskStatusService],
  exports: [TaskStatusService],
})
export class TaskStatusModule {}
