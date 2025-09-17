import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { NotificationHelperService } from '../../shared/notifications/notification-helper.service';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [TasksController],
  providers: [TasksService, NotificationHelperService],
  exports: [TasksService],
})
export class TasksModule {}
