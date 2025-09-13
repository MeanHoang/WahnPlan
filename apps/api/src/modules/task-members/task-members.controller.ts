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
import { TaskMembersService } from './task-members.service';
import { CreateTaskMemberDto } from './dto/create-task-member.dto';
import { UpdateTaskMemberDto } from './dto/update-task-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('task-members')
@UseGuards(JwtAuthGuard)
export class TaskMembersController {
  constructor(private readonly taskMembersService: TaskMembersService) {}

  @Post()
  create(@Body() createTaskMemberDto: CreateTaskMemberDto, @Req() req: any) {
    return this.taskMembersService.create(createTaskMemberDto, req.user.id);
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('taskId') taskId?: string,
    @Query('userId') userId?: string,
  ) {
    if (!taskId && !userId) {
      throw new Error('Either taskId or userId query parameter is required');
    }
    return this.taskMembersService.findAll(taskId, req.user.id, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.taskMembersService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskMemberDto: UpdateTaskMemberDto,
    @Req() req: any,
  ) {
    return this.taskMembersService.update(id, updateTaskMemberDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.taskMembersService.remove(id, req.user.id);
  }

  @Post('reorder')
  reorder(
    @Body() body: { taskId: string; memberIds: string[] },
    @Req() req: any,
  ) {
    return this.taskMembersService.reorder(
      body.taskId,
      body.memberIds,
      req.user.id,
    );
  }
}
