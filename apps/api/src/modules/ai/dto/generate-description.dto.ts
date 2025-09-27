import { IsOptional, IsString, MinLength } from 'class-validator';

export class GenerateDescriptionDto {
  @IsString()
  @MinLength(3)
  taskTitle: string;

  @IsOptional()
  @IsString()
  boardTitle?: string;

  @IsOptional()
  @IsString()
  boardSubtitle?: string;

  @IsOptional()
  @IsString()
  taskNotes?: string;
}
