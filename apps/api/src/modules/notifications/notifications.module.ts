import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { EmailModule } from '../../shared/email/email.module';
import { NotificationHelperService } from '../../shared/notifications/notification-helper.service';
import { EmailTranslationsService } from '../../shared/notifications/email-translations.service';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationHelperService,
    EmailTranslationsService,
  ],
  exports: [NotificationsService, NotificationHelperService],
})
export class NotificationsModule {}
