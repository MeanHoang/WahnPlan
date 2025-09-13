import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskInitiativeDto } from './create-task-initiative.dto';

export class UpdateTaskInitiativeDto extends PartialType(
  CreateTaskInitiativeDto,
) {}
