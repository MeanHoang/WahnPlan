import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './shared/prisma/prisma.module';
import { EmailModule } from './shared/email/email.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { WorkspaceMembersModule } from './modules/workspace-members/workspace-members.module';
import { BoardsModule } from './modules/boards/boards.module';
import { UploadModule } from './modules/upload/upload.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { TaskStatusModule } from './modules/task-status/task-status.module';
import { TaskPriorityModule } from './modules/task-priority/task-priority.module';
import { TaskInitiativeModule } from './modules/task-initiative/task-initiative.module';
import { TaskMembersModule } from './modules/task-members/task-members.module';
import { TaskCommentsModule } from './modules/task-comments/task-comments.module';
import { CommentReactionsModule } from './modules/comment-reactions/comment-reactions.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    EmailModule,
    AuthModule,
    UsersModule,
    WorkspacesModule,
    WorkspaceMembersModule,
    BoardsModule,
    UploadModule,
    TasksModule,
    TaskStatusModule,
    TaskPriorityModule,
    TaskInitiativeModule,
    TaskMembersModule,
    TaskCommentsModule,
    CommentReactionsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
