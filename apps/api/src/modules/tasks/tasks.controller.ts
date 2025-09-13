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
  BadRequestException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFiltersDto } from './dto/task-filters.dto';
import { FindTasksQueryDto } from './dto/find-tasks-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Req() req: any) {
    return this.tasksService.create(createTaskDto, req.user.id);
  }

  @Get()
  findAll(@Query() query: FindTasksQueryDto, @Req() req: any) {
    const { boardId, ...filters } = query;

    if (!boardId) {
      throw new BadRequestException('boardId query parameter is required');
    }

    return this.tasksService.findAll(
      boardId,
      req.user.id,
      filters as TaskFiltersDto,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.tasksService.findOne(id, req.user.id);
  }

  @Get('stats/:boardId')
  getStats(@Param('boardId') boardId: string, @Req() req: any) {
    return this.tasksService.getTaskStats(boardId, req.user.id);
  }

  @Get('user/:userId')
  findByUser(
    @Param('userId') userId: string,
    @Query() filters: TaskFiltersDto,
    @Req() req: any,
  ) {
    return this.tasksService.findByUser(userId, req.user.id, filters);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req: any,
  ) {
    return this.tasksService.update(id, updateTaskDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.tasksService.remove(id, req.user.id);
  }
}
