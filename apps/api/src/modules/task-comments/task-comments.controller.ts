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
import { TaskCommentsService } from './task-comments.service';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { UpdateTaskCommentDto } from './dto/update-task-comment.dto';
import { CommentQueryDto } from './dto/comment-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('task-comments')
@UseGuards(JwtAuthGuard)
export class TaskCommentsController {
  constructor(private readonly taskCommentsService: TaskCommentsService) {}

  @Post()
  create(@Body() createCommentDto: CreateTaskCommentDto, @Req() req: any) {
    return this.taskCommentsService.create(createCommentDto, req.user.id);
  }

  @Get('task/:taskId')
  findAll(
    @Param('taskId') taskId: string,
    @Query() query: CommentQueryDto,
    @Req() req: any,
  ) {
    return this.taskCommentsService.findAll(taskId, req.user.id, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.taskCommentsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateTaskCommentDto,
    @Req() req: any,
  ) {
    return this.taskCommentsService.update(id, updateCommentDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.taskCommentsService.remove(id, req.user.id);
  }

  // Comment Attachments
  @Post(':id/attachments')
  addAttachment(
    @Param('id') commentId: string,
    @Body() attachmentData: any,
    @Req() req: any,
  ) {
    return this.taskCommentsService.addAttachment(
      commentId,
      attachmentData,
      req.user.id,
    );
  }

  @Delete('attachments/:attachmentId')
  removeAttachment(
    @Param('attachmentId') attachmentId: string,
    @Req() req: any,
  ) {
    return this.taskCommentsService.removeAttachment(attachmentId, req.user.id);
  }
}
