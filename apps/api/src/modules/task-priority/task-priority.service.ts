import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateTaskPriorityDto } from './dto/create-task-priority.dto';
import { UpdateTaskPriorityDto } from './dto/update-task-priority.dto';
import { WorkspaceMemberRole } from '@prisma/client';

@Injectable()
export class TaskPriorityService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskPriorityDto: CreateTaskPriorityDto, userId: string) {
    // Check if user has permission to create task priority in board
    const board = await this.prisma.board.findFirst({
      where: {
        id: createTaskPriorityDto.boardId,
        workspace: {
          members: {
            some: {
              userId,
              role: {
                in: [
                  WorkspaceMemberRole.owner,
                  WorkspaceMemberRole.manager,
                  WorkspaceMemberRole.member,
                ],
              },
            },
          },
        },
      },
    });

    if (!board) {
      throw new ForbiddenException(
        'Insufficient permissions to create task priority',
      );
    }

    return this.prisma.taskPriority.create({
      data: {
        boardId: createTaskPriorityDto.boardId,
        name: createTaskPriorityDto.name,
        color: createTaskPriorityDto.color,
        position: createTaskPriorityDto.position,
      },
      include: {
        board: {
          select: {
            id: true,
            title: true,
            workspace: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });
  }

  async findAll(boardId: string, userId: string) {
    // Check if user has access to the board
    const board = await this.prisma.board.findFirst({
      where: {
        id: boardId,
        workspace: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
    });

    if (!board) {
      throw new ForbiddenException('Access denied to board');
    }

    return this.prisma.taskPriority.findMany({
      where: {
        boardId,
      },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        position: 'asc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const taskPriority = await this.prisma.taskPriority.findFirst({
      where: {
        id,
        board: {
          workspace: {
            members: {
              some: {
                userId,
              },
            },
          },
        },
      },
      include: {
        board: {
          select: {
            id: true,
            title: true,
            workspace: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    if (!taskPriority) {
      throw new NotFoundException('Task priority not found');
    }

    return taskPriority;
  }

  async update(
    id: string,
    updateTaskPriorityDto: UpdateTaskPriorityDto,
    userId: string,
  ) {
    // First get the task priority to check board access
    const taskPriority = await this.prisma.taskPriority.findFirst({
      where: {
        id,
        board: {
          workspace: {
            members: {
              some: {
                userId,
              },
            },
          },
        },
      },
      include: {
        board: true,
      },
    });

    if (!taskPriority) {
      throw new NotFoundException('Task priority not found');
    }

    // Check if user has permission to update task priority
    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: taskPriority.board.workspaceId,
        userId,
        role: {
          in: [WorkspaceMemberRole.owner, WorkspaceMemberRole.manager],
        },
      },
    });

    if (!member) {
      throw new ForbiddenException(
        'Insufficient permissions to update task priority',
      );
    }

    return this.prisma.taskPriority.update({
      where: { id },
      data: updateTaskPriorityDto,
      include: {
        board: {
          select: {
            id: true,
            title: true,
            workspace: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    // First get the task priority to check board access
    const taskPriority = await this.prisma.taskPriority.findFirst({
      where: {
        id,
        board: {
          workspace: {
            members: {
              some: {
                userId,
              },
            },
          },
        },
      },
      include: {
        board: true,
      },
    });

    if (!taskPriority) {
      throw new NotFoundException('Task priority not found');
    }

    // Check if user has permission to delete task priority
    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: taskPriority.board.workspaceId,
        userId,
        role: {
          in: [WorkspaceMemberRole.owner, WorkspaceMemberRole.manager],
        },
      },
    });

    if (!member) {
      throw new ForbiddenException(
        'Insufficient permissions to delete task priority',
      );
    }

    // Check if there are tasks using this priority
    const taskCount = await this.prisma.task.count({
      where: {
        taskPriorityId: id,
      },
    });

    if (taskCount > 0) {
      throw new BadRequestException(
        'Cannot delete task priority that is being used by tasks',
      );
    }

    await this.prisma.taskPriority.delete({
      where: { id },
    });

    return { message: 'Task priority deleted successfully' };
  }

  async reorder(boardId: string, priorityIds: string[], userId: string) {
    // Check if user has access to the board
    const board = await this.prisma.board.findFirst({
      where: {
        id: boardId,
        workspace: {
          members: {
            some: {
              userId,
              role: {
                in: [WorkspaceMemberRole.owner, WorkspaceMemberRole.manager],
              },
            },
          },
        },
      },
    });

    if (!board) {
      throw new ForbiddenException('Access denied to board');
    }

    // Update positions
    const updatePromises = priorityIds.map((priorityId, index) =>
      this.prisma.taskPriority.update({
        where: { id: priorityId },
        data: { position: index },
      }),
    );

    await Promise.all(updatePromises);

    return { message: 'Task priorities reordered successfully' };
  }
}
