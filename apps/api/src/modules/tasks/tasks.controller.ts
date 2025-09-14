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
    const { boardId, page, limit, ...rawFilters } = query;

    if (!boardId) {
      console.error('TasksController.findAll - boardId is missing:', {
        query,
        boardId,
      });
      throw new BadRequestException('boardId query parameter is required');
    }

    // Process filters to handle multiple values
    const filters: TaskFiltersDto = {
      assigneeId: rawFilters.assigneeId,
      reviewerId: rawFilters.reviewerId,
      baId: rawFilters.baId,
      taskStatusId: rawFilters.taskStatusId,
      taskPriorityId: rawFilters.taskPriorityId,
      taskInitiativeId: rawFilters.taskInitiativeId,
      sprint: rawFilters.sprint,
      featureCategories: rawFilters.featureCategories,
      isOverdue: rawFilters.isOverdue === 'true',
      createdById: rawFilters.createdById,
      dueDateFrom: rawFilters.dueDateFrom,
      dueDateTo: rawFilters.dueDateTo,
      createdAtFrom: rawFilters.createdAtFrom,
      createdAtTo: rawFilters.createdAtTo,
    };

    // Convert comma-separated strings to arrays for multiple value filters
    if (
      rawFilters.taskStatusIds &&
      typeof rawFilters.taskStatusIds === 'string'
    ) {
      filters.taskStatusIds = rawFilters.taskStatusIds
        .split(',')
        .filter(Boolean);
    }

    if (
      rawFilters.taskPriorityIds &&
      typeof rawFilters.taskPriorityIds === 'string'
    ) {
      filters.taskPriorityIds = rawFilters.taskPriorityIds
        .split(',')
        .filter(Boolean);
    }

    if (
      rawFilters.taskInitiativeIds &&
      typeof rawFilters.taskInitiativeIds === 'string'
    ) {
      filters.taskInitiativeIds = rawFilters.taskInitiativeIds
        .split(',')
        .filter(Boolean);
    }

    // Convert comma-separated strings to arrays for multiple assignee/reviewer/BA filters
    if (rawFilters.assigneeIds && typeof rawFilters.assigneeIds === 'string') {
      filters.assigneeIds = rawFilters.assigneeIds.split(',').filter(Boolean);
    }

    if (rawFilters.reviewerIds && typeof rawFilters.reviewerIds === 'string') {
      filters.reviewerIds = rawFilters.reviewerIds.split(',').filter(Boolean);
    }

    if (rawFilters.baIds && typeof rawFilters.baIds === 'string') {
      filters.baIds = rawFilters.baIds.split(',').filter(Boolean);
    }

    if (rawFilters.memberIds && typeof rawFilters.memberIds === 'string') {
      filters.memberIds = rawFilters.memberIds.split(',').filter(Boolean);
    }

    // Add sorting parameters
    if (rawFilters.sortBy) {
      filters.sortBy = rawFilters.sortBy;
    }
    if (rawFilters.sortOrder) {
      filters.sortOrder = rawFilters.sortOrder;
    }

    return this.tasksService.findAll(
      boardId,
      req.user.id,
      filters,
      page || 1,
      limit || 10,
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
