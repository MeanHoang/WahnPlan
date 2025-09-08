import { IsEnum } from 'class-validator';
import { WorkspaceMemberRole } from '@prisma/client';

export class UpdateMemberRoleDto {
  @IsEnum(WorkspaceMemberRole)
  role: WorkspaceMemberRole;
}
