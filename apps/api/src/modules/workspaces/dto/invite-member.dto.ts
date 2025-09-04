import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { WorkspaceMemberRole } from '@prisma/client';

export class InviteMemberDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(WorkspaceMemberRole)
  role?: WorkspaceMemberRole;

  @IsOptional()
  @IsString()
  message?: string;
}
