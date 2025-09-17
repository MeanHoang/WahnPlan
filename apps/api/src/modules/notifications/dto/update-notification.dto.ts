import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { NotificationStatus } from '@prisma/client';

export class UpdateNotificationDto {
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
