import { IsString, IsInt } from 'class-validator';

export class CreateTaskMemberDto {
  @IsString()
  taskId: string;

  @IsString()
  userId: string;

  @IsInt()
  position: number;
}
