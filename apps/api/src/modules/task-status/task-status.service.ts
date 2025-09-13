import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateTaskStatusDto } from './dto/create-task-status.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { WorkspaceMemberRole } from '@prisma/client';

@Injectable()
export class TaskStatusService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskStatusDto: CreateTaskStatusDto, userId: string) {
    // Check if user has permission to create task status in board
    const board = await this.prisma.board.findFirst({
      where: {
        id: createTaskStatusDto.boardId,
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
        'Insufficient permissions to create task status',
      );
    }

    return this.prisma.taskStatus.create({
      data: {
        boardId: createTaskStatusDto.boardId,
        title: createTaskStatusDto.title,
        position: createTaskStatusDto.position,
        color: createTaskStatusDto.color,
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

    return this.prisma.taskStatus.findMany({
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
    const taskStatus = await this.prisma.taskStatus.findFirst({
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

    if (!taskStatus) {
      throw new NotFoundException('Task status not found');
    }

    return taskStatus;
  }

  async update(
    id: string,
    updateTaskStatusDto: UpdateTaskStatusDto,
    userId: string,
  ) {
    // First get the task status to check board access
    const taskStatus = await this.prisma.taskStatus.findFirst({
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

    if (!taskStatus) {
      throw new NotFoundException('Task status not found');
    }

    // Check if user has permission to update task status
    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: taskStatus.board.workspaceId,
        userId,
        role: {
          in: [WorkspaceMemberRole.owner, WorkspaceMemberRole.manager],
        },
      },
    });

    if (!member) {
      throw new ForbiddenException(
        'Insufficient permissions to update task status',
      );
    }

    return this.prisma.taskStatus.update({
      where: { id },
      data: updateTaskStatusDto,
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
    // First get the task status to check board access
    const taskStatus = await this.prisma.taskStatus.findFirst({
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

    if (!taskStatus) {
      throw new NotFoundException('Task status not found');
    }

    // Check if user has permission to delete task status
    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: taskStatus.board.workspaceId,
        userId,
        role: {
          in: [WorkspaceMemberRole.owner, WorkspaceMemberRole.manager],
        },
      },
    });

    if (!member) {
      throw new ForbiddenException(
        'Insufficient permissions to delete task status',
      );
    }

    // Check if there are tasks using this status
    const taskCount = await this.prisma.task.count({
      where: {
        taskStatusId: id,
      },
    });

    if (taskCount > 0) {
      throw new BadRequestException(
        'Cannot delete task status that is being used by tasks',
      );
    }

    await this.prisma.taskStatus.delete({
      where: { id },
    });

    return { message: 'Task status deleted successfully' };
  }

  async reorder(boardId: string, statusIds: string[], userId: string) {
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
    const updatePromises = statusIds.map((statusId, index) =>
      this.prisma.taskStatus.update({
        where: { id: statusId },
        data: { position: index },
      }),
    );

    await Promise.all(updatePromises);

    return { message: 'Task statuses reordered successfully' };
  }
}
