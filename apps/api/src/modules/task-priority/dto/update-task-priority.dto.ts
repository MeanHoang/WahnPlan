import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskPriorityDto } from './create-task-priority.dto';

export class UpdateTaskPriorityDto extends PartialType(CreateTaskPriorityDto) {}
