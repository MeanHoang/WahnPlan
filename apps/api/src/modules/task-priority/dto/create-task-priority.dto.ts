import { IsString, IsInt } from 'class-validator';

export class CreateTaskPriorityDto {
  @IsString()
  boardId: string;

  @IsString()
  name: string;

  @IsString()
  color: string;

  @IsInt()
  position: number;
}
