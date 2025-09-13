import { Module } from '@nestjs/common';
import { TaskPriorityService } from './task-priority.service';
import { TaskPriorityController } from './task-priority.controller';
import { PrismaModule } from '../../shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TaskPriorityController],
  providers: [TaskPriorityService],
  exports: [TaskPriorityService],
})
export class TaskPriorityModule {}
