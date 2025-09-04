import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { WorkspaceVisibility } from '@prisma/client';

export class CreateWorkspaceDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(WorkspaceVisibility)
  visibility?: WorkspaceVisibility;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsBoolean()
  notifyTaskDueSoon?: boolean;
}
