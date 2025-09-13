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
import { TaskStatusService } from './task-status.service';
import { CreateTaskStatusDto } from './dto/create-task-status.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('task-status')
@UseGuards(JwtAuthGuard)
export class TaskStatusController {
  constructor(private readonly taskStatusService: TaskStatusService) {}

  @Post()
  create(@Body() createTaskStatusDto: CreateTaskStatusDto, @Req() req: any) {
    return this.taskStatusService.create(createTaskStatusDto, req.user.id);
  }

  @Get()
  findAll(@Query('boardId') boardId: string, @Req() req: any) {
    if (!boardId) {
      throw new Error('boardId query parameter is required');
    }
    return this.taskStatusService.findAll(boardId, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.taskStatusService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
    @Req() req: any,
  ) {
    return this.taskStatusService.update(id, updateTaskStatusDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.taskStatusService.remove(id, req.user.id);
  }

  @Post('reorder')
  reorder(
    @Body() body: { boardId: string; statusIds: string[] },
    @Req() req: any,
  ) {
    return this.taskStatusService.reorder(
      body.boardId,
      body.statusIds,
      req.user.id,
    );
  }
}
