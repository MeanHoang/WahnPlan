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
import { TaskInitiativeService } from './task-initiative.service';
import { CreateTaskInitiativeDto } from './dto/create-task-initiative.dto';
import { UpdateTaskInitiativeDto } from './dto/update-task-initiative.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('task-initiative')
@UseGuards(JwtAuthGuard)
export class TaskInitiativeController {
  constructor(private readonly taskInitiativeService: TaskInitiativeService) {}

  @Post()
  create(
    @Body() createTaskInitiativeDto: CreateTaskInitiativeDto,
    @Req() req: any,
  ) {
    return this.taskInitiativeService.create(
      createTaskInitiativeDto,
      req.user.id,
    );
  }

  @Get()
  findAll(@Query('boardId') boardId: string, @Req() req: any) {
    if (!boardId) {
      throw new Error('boardId query parameter is required');
    }
    return this.taskInitiativeService.findAll(boardId, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.taskInitiativeService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskInitiativeDto: UpdateTaskInitiativeDto,
    @Req() req: any,
  ) {
    return this.taskInitiativeService.update(
      id,
      updateTaskInitiativeDto,
      req.user.id,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.taskInitiativeService.remove(id, req.user.id);
  }

  @Post('reorder')
  reorder(
    @Body() body: { boardId: string; initiativeIds: string[] },
    @Req() req: any,
  ) {
    return this.taskInitiativeService.reorder(
      body.boardId,
      body.initiativeIds,
      req.user.id,
    );
  }
}
