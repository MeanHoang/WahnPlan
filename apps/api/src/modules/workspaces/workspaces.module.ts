import { Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';

@Module({
  imports: [PrismaModule, WorkspaceMembersModule],
  controllers: [WorkspacesController],
  providers: [WorkspacesService],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
