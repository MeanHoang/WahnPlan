import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { TaskPriorityService } from './task-priority.service';
import { CreateTaskPriorityDto } from './dto/create-task-priority.dto';
import { UpdateTaskPriorityDto } from './dto/update-task-priority.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('task-priority')
@UseGuards(JwtAuthGuard)
export class TaskPriorityController {
  constructor(private readonly taskPriorityService: TaskPriorityService) {}

  @Post()
  create(
    @Body() createTaskPriorityDto: CreateTaskPriorityDto,
    @Req() req: any,
  ) {
    return this.taskPriorityService.create(createTaskPriorityDto, req.user.id);
  }

  @Get()
  findAll(@Query('boardId') boardId: string, @Req() req: any) {
    if (!boardId) {
      throw new Error('boardId query parameter is required');
    }
    return this.taskPriorityService.findAll(boardId, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.taskPriorityService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskPriorityDto: UpdateTaskPriorityDto,
    @Req() req: any,
  ) {
    return this.taskPriorityService.update(
      id,
      updateTaskPriorityDto,
      req.user.id,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.taskPriorityService.remove(id, req.user.id);
  }

  @Post('reorder')
  reorder(
    @Body() body: { boardId: string; priorityIds: string[] },
    @Req() req: any,
  ) {
    return this.taskPriorityService.reorder(
      body.boardId,
      body.priorityIds,
      req.user.id,
    );
  }
}
