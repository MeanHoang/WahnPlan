import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateTaskStatusDto {
  @IsString()
  boardId: string;

  @IsString()
  title: string;

  @IsInt()
  position: number;

  @IsString()
  color: string;
}
