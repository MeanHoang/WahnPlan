import { Module } from '@nestjs/common';
import { TaskMembersService } from './task-members.service';
import { TaskMembersController } from './task-members.controller';
import { PrismaModule } from '../../shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TaskMembersController],
  providers: [TaskMembersService],
  exports: [TaskMembersService],
})
export class TaskMembersModule {}
