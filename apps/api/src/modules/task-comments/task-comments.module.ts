import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { TaskCommentsService } from './task-comments.service';
import { TaskCommentsController } from './task-comments.controller';

@Module({
  imports: [PrismaModule],
  controllers: [TaskCommentsController],
  providers: [TaskCommentsService],
  exports: [TaskCommentsService],
})
export class TaskCommentsModule {}
