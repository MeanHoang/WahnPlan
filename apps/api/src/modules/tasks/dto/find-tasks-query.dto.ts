import { IsString, IsOptional } from 'class-validator';

export class FindTasksQueryDto {
  @IsString()
  boardId: string;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsString()
  reviewerId?: string;

  @IsOptional()
  @IsString()
  baId?: string;

  @IsOptional()
  @IsString()
  taskStatusId?: string;

  @IsOptional()
  @IsString()
  taskPriorityId?: string;

  @IsOptional()
  @IsString()
  taskInitiativeId?: string;

  @IsOptional()
  @IsString()
  sprint?: string;

  @IsOptional()
  @IsString()
  featureCategories?: string;

  @IsOptional()
  @IsString()
  isOverdue?: string;

  @IsOptional()
  @IsString()
  createdById?: string;
}
