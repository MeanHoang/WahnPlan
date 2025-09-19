import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { EmailModule } from '../../shared/email/email.module';
import { NotificationHelperService } from '../../shared/notifications/notification-helper.service';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationHelperService],
  exports: [NotificationsService, NotificationHelperService],
})
export class NotificationsModule {}
