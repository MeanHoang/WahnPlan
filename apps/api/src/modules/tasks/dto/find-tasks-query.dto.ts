import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

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

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
