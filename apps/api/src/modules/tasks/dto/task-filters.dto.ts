import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class TaskFiltersDto {
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
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isOverdue?: boolean;

  @IsOptional()
  @IsString()
  createdById?: string;
}
