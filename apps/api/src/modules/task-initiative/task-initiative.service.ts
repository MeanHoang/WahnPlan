import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateTaskInitiativeDto } from './dto/create-task-initiative.dto';
import { UpdateTaskInitiativeDto } from './dto/update-task-initiative.dto';
import { WorkspaceMemberRole } from '@prisma/client';

@Injectable()
export class TaskInitiativeService {
  constructor(private prisma: PrismaService) {}

  async create(
    createTaskInitiativeDto: CreateTaskInitiativeDto,
    userId: string,
  ) {
    // Check if user has permission to create task initiative in board
    const board = await this.prisma.board.findFirst({
      where: {
        id: createTaskInitiativeDto.boardId,
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
        'Insufficient permissions to create task initiative',
      );
    }

    return this.prisma.taskInitiative.create({
      data: {
        boardId: createTaskInitiativeDto.boardId,
        name: createTaskInitiativeDto.name,
        color: createTaskInitiativeDto.color,
        position: createTaskInitiativeDto.position,
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

    return this.prisma.taskInitiative.findMany({
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
    const taskInitiative = await this.prisma.taskInitiative.findFirst({
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

    if (!taskInitiative) {
      throw new NotFoundException('Task initiative not found');
    }

    return taskInitiative;
  }

  async update(
    id: string,
    updateTaskInitiativeDto: UpdateTaskInitiativeDto,
    userId: string,
  ) {
    // First get the task initiative to check board access
    const taskInitiative = await this.prisma.taskInitiative.findFirst({
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

    if (!taskInitiative) {
      throw new NotFoundException('Task initiative not found');
    }

    // Check if user has permission to update task initiative
    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: taskInitiative.board.workspaceId,
        userId,
        role: {
          in: [WorkspaceMemberRole.owner, WorkspaceMemberRole.manager],
        },
      },
    });

    if (!member) {
      throw new ForbiddenException(
        'Insufficient permissions to update task initiative',
      );
    }

    return this.prisma.taskInitiative.update({
      where: { id },
      data: updateTaskInitiativeDto,
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
    // First get the task initiative to check board access
    const taskInitiative = await this.prisma.taskInitiative.findFirst({
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

    if (!taskInitiative) {
      throw new NotFoundException('Task initiative not found');
    }

    // Check if user has permission to delete task initiative
    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: taskInitiative.board.workspaceId,
        userId,
        role: {
          in: [WorkspaceMemberRole.owner, WorkspaceMemberRole.manager],
        },
      },
    });

    if (!member) {
      throw new ForbiddenException(
        'Insufficient permissions to delete task initiative',
      );
    }

    // Check if there are tasks using this initiative
    const taskCount = await this.prisma.task.count({
      where: {
        taskInitiativeId: id,
      },
    });

    if (taskCount > 0) {
      throw new BadRequestException(
        'Cannot delete task initiative that is being used by tasks',
      );
    }

    await this.prisma.taskInitiative.delete({
      where: { id },
    });

    return { message: 'Task initiative deleted successfully' };
  }

  async reorder(boardId: string, initiativeIds: string[], userId: string) {
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
    const updatePromises = initiativeIds.map((initiativeId, index) =>
      this.prisma.taskInitiative.update({
        where: { id: initiativeId },
        data: { position: index },
      }),
    );

    await Promise.all(updatePromises);

    return { message: 'Task initiatives reordered successfully' };
  }
}
