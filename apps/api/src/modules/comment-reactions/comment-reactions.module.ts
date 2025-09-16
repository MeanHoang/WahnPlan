import { Module } from '@nestjs/common';
import { CommentReactionsController } from './comment-reactions.controller';
import { CommentReactionsService } from './comment-reactions.service';
import { PrismaModule } from '../../shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CommentReactionsController],
  providers: [CommentReactionsService],
  exports: [CommentReactionsService],
})
export class CommentReactionsModule {}
