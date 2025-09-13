import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskMemberDto } from './create-task-member.dto';

export class UpdateTaskMemberDto extends PartialType(CreateTaskMemberDto) {}
