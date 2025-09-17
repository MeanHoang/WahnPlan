import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { TaskCommentsService } from './task-comments.service';
import { TaskCommentsController } from './task-comments.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { NotificationHelperService } from '../../shared/notifications/notification-helper.service';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [TaskCommentsController],
  providers: [TaskCommentsService, NotificationHelperService],
  exports: [TaskCommentsService],
})
export class TaskCommentsModule {}
