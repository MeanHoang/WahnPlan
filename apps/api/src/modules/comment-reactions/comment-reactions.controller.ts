import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CommentReactionsService } from './comment-reactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddReactionDto } from './dto/add-reaction.dto';

@Controller('comment-reactions')
@UseGuards(JwtAuthGuard)
export class CommentReactionsController {
  constructor(
    private readonly commentReactionsService: CommentReactionsService,
  ) {}

  @Post(':commentId')
  addReaction(
    @Param('commentId') commentId: string,
    @Body() addReactionDto: AddReactionDto,
    @Req() req: any,
  ) {
    return this.commentReactionsService.addReaction(
      commentId,
      addReactionDto.emoji,
      req.user.id,
    );
  }

  @Get(':commentId')
  getReactions(@Param('commentId') commentId: string, @Req() req: any) {
    return this.commentReactionsService.getReactions(commentId, req.user.id);
  }

  @Get(':commentId/stats')
  getReactionStats(@Param('commentId') commentId: string, @Req() req: any) {
    return this.commentReactionsService.getReactionStats(
      commentId,
      req.user.id,
    );
  }

  @Delete(':commentId/:emoji')
  removeReaction(
    @Param('commentId') commentId: string,
    @Param('emoji') emoji: string,
    @Req() req: any,
  ) {
    return this.commentReactionsService.removeReaction(
      commentId,
      emoji,
      req.user.id,
    );
  }
}
