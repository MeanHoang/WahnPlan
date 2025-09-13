import { IsString, IsOptional } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  workspaceId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  subtitle?: string;
}
