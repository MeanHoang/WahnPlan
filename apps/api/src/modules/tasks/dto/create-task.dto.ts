import {
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  IsObject,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  boardId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  taskStatusId?: string;

  @IsOptional()
  @IsString()
  taskInitiativeId?: string;

  @IsOptional()
  @IsString()
  taskPriorityId?: string;

  @IsOptional()
  @IsString()
  okr?: string;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsString()
  reviewerId?: string;

  @IsOptional()
  @IsInt()
  storyPoint?: number;

  @IsOptional()
  @IsString()
  sizeCard?: string;

  @IsOptional()
  @IsString()
  testCase?: string;

  @IsOptional()
  @IsDateString()
  goLive?: string;

  @IsOptional()
  @IsString()
  devMr?: string;

  @IsOptional()
  @IsString()
  baId?: string;

  @IsOptional()
  @IsString()
  staging?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  sprint?: string;

  @IsOptional()
  @IsString()
  featureCategories?: string;

  @IsOptional()
  @IsString()
  sprintGoal?: string;

  @IsOptional()
  @IsObject()
  descriptionJson?: any;

  @IsOptional()
  @IsString()
  descriptionPlain?: string;

  @IsOptional()
  @IsObject()
  noteJson?: any;

  @IsOptional()
  @IsString()
  notePlain?: string;

  @IsOptional()
  @IsObject()
  attachments?: any;
}
