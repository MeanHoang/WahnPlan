import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFiltersDto } from './dto/task-filters.dto';
import { WorkspaceMemberRole } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    // Check if user has permission to create task in board
    const board = await this.prisma.board.findFirst({
      where: {
        id: createTaskDto.boardId,
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
      throw new ForbiddenException('Insufficient permissions to create task');
    }

    // Validate related entities if provided
    if (createTaskDto.taskStatusId) {
      const taskStatus = await this.prisma.taskStatus.findFirst({
        where: {
          id: createTaskDto.taskStatusId,
          boardId: createTaskDto.boardId,
        },
      });
      if (!taskStatus) {
        throw new BadRequestException('Invalid task status for this board');
      }
    }

    if (createTaskDto.taskPriorityId) {
      const taskPriority = await this.prisma.taskPriority.findFirst({
        where: {
          id: createTaskDto.taskPriorityId,
          boardId: createTaskDto.boardId,
        },
      });
      if (!taskPriority) {
        throw new BadRequestException('Invalid task priority for this board');
      }
    }

    if (createTaskDto.taskInitiativeId) {
      const taskInitiative = await this.prisma.taskInitiative.findFirst({
        where: {
          id: createTaskDto.taskInitiativeId,
          boardId: createTaskDto.boardId,
        },
      });
      if (!taskInitiative) {
        throw new BadRequestException('Invalid task initiative for this board');
      }
    }

    // Validate assignee, reviewer, and BA if provided
    if (createTaskDto.assigneeId) {
      const assignee = await this.prisma.workspaceMember.findFirst({
        where: {
          workspaceId: board.workspaceId,
          userId: createTaskDto.assigneeId,
        },
      });
      if (!assignee) {
        throw new BadRequestException(
          'Assignee is not a member of the workspace',
        );
      }
    }

    if (createTaskDto.reviewerId) {
      const reviewer = await this.prisma.workspaceMember.findFirst({
        where: {
          workspaceId: board.workspaceId,
          userId: createTaskDto.reviewerId,
        },
      });
      if (!reviewer) {
        throw new BadRequestException(
          'Reviewer is not a member of the workspace',
        );
      }
    }

    if (createTaskDto.baId) {
      const baUser = await this.prisma.workspaceMember.findFirst({
        where: {
          workspaceId: board.workspaceId,
          userId: createTaskDto.baId,
        },
      });
      if (!baUser) {
        throw new BadRequestException(
          'BA user is not a member of the workspace',
        );
      }
    }

    const task = await this.prisma.task.create({
      data: {
        boardId: createTaskDto.boardId,
        title: createTaskDto.title,
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
        taskStatusId: createTaskDto.taskStatusId,
        taskInitiativeId: createTaskDto.taskInitiativeId,
        taskPriorityId: createTaskDto.taskPriorityId,
        okr: createTaskDto.okr,
        assigneeId: createTaskDto.assigneeId,
        reviewerId: createTaskDto.reviewerId,
        storyPoint: createTaskDto.storyPoint,
        sizeCard: createTaskDto.sizeCard,
        testCase: createTaskDto.testCase,
        goLive: createTaskDto.goLive ? new Date(createTaskDto.goLive) : null,
        devMr: createTaskDto.devMr,
        baId: createTaskDto.baId,
        staging: createTaskDto.staging,
        note: createTaskDto.note,
        createdById: userId,
        createdTime: new Date(),
        sprint: createTaskDto.sprint,
        featureCategories: createTaskDto.featureCategories,
        sprintGoal: createTaskDto.sprintGoal,
        descriptionJson: createTaskDto.descriptionJson,
        descriptionPlain: createTaskDto.descriptionPlain,
        noteJson: createTaskDto.noteJson,
        notePlain: createTaskDto.notePlain,
        attachments: createTaskDto.attachments,
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
        taskStatus: true,
        taskPriority: true,
        taskInitiative: true,
        assignee: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        baUser: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        taskMembers: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullname: true,
                publicName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            position: 'asc',
          },
        },
        _count: {
          select: {
            taskMembers: true,
            taskComments: true,
            taskHistory: true,
          },
        },
      },
    });

    // Create initial history record
    await this.prisma.taskHistory.create({
      data: {
        taskId: task.id,
        version: 1,
        changedById: userId,
        changedAt: new Date(),
        title: task.title,
        dueDate: task.dueDate,
        taskStatusId: task.taskStatusId,
        taskInitiativeId: task.taskInitiativeId,
        taskPriorityId: task.taskPriorityId,
        okr: task.okr,
        assigneeId: task.assigneeId,
        reviewerId: task.reviewerId,
        storyPoint: task.storyPoint,
        sizeCard: task.sizeCard,
        testCase: task.testCase,
        goLive: task.goLive,
        devMr: task.devMr,
        baId: task.baId,
        staging: task.staging,
        note: task.note,
        createdById: task.createdById,
        createdTime: task.createdTime,
        sprint: task.sprint,
        featureCategories: task.featureCategories,
        sprintGoal: task.sprintGoal,
        descriptionJson: task.descriptionJson as any,
        descriptionPlain: task.descriptionPlain,
        noteJson: task.noteJson as any,
        notePlain: task.notePlain,
        attachments: task.attachments as any,
      },
    });

    return task;
  }

  private buildOrderBy(sortBy?: string, sortOrder?: 'asc' | 'desc') {
    const order = sortOrder || 'desc';

    switch (sortBy) {
      case 'title':
        return { title: order };
      case 'createdAt':
        return { createdTime: order };
      case 'dueDate':
        // Sort by due date, with null values last
        return [
          { dueDate: order },
          { dueDate: order === 'asc' ? 'desc' : 'asc' }, // null values last
        ];
      case 'priority':
        // Sort by priority position (lower position = higher priority)
        // Null values (no priority) should be treated as position 99 (always last)
        // Use taskPriorityId to ensure nulls are handled correctly
        if (order === 'asc') {
          return [
            { taskPriorityId: 'asc' }, // nulls first for asc
            { taskPriority: { position: 'asc' } },
          ];
        } else {
          return [
            { taskPriority: { position: 'desc' } },
            { taskPriorityId: 'desc' }, // nulls last for desc
          ];
        }
      case 'status':
        // Sort by status title, with null values last
        return [
          { taskStatus: { title: order } },
          { taskStatusId: order === 'asc' ? 'desc' : 'asc' }, // null values last
        ];
      case 'initiative':
        // Sort by initiative name, with null values last
        return [
          { taskInitiative: { name: order } },
          { taskInitiativeId: order === 'asc' ? 'desc' : 'asc' }, // null values last
        ];
      case 'sizeCard':
        // Sort by size card, with null values last
        return [
          { sizeCard: order },
          { sizeCard: order === 'asc' ? 'desc' : 'asc' }, // null values last
        ];
      default:
        return { createdTime: 'desc' };
    }
  }

  async findAll(
    boardId: string,
    userId: string,
    filters: TaskFiltersDto = {},
    page: number = 1,
    limit: number = 10,
  ) {
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

    // Build where clause with filters
    const whereClause: any = {
      boardId,
    };

    // Add filters if provided
    if (filters.assigneeId) {
      whereClause.assigneeId = filters.assigneeId;
    }

    if (filters.reviewerId) {
      whereClause.reviewerId = filters.reviewerId;
    }

    if (filters.baId) {
      whereClause.baId = filters.baId;
    }

    // Handle multiple assignee filters (new feature)
    if (filters.assigneeIds && filters.assigneeIds.length > 0) {
      whereClause.assigneeId = {
        in: filters.assigneeIds,
      };
    }

    // Handle multiple reviewer filters (new feature)
    if (filters.reviewerIds && filters.reviewerIds.length > 0) {
      whereClause.reviewerId = {
        in: filters.reviewerIds,
      };
    }

    // Handle multiple BA filters (new feature)
    if (filters.baIds && filters.baIds.length > 0) {
      whereClause.baId = {
        in: filters.baIds,
      };
    }

    // Handle multiple member filters (new feature) - special case using taskMembers relation
    if (filters.memberIds && filters.memberIds.length > 0) {
      whereClause.taskMembers = {
        some: {
          userId: {
            in: filters.memberIds,
          },
        },
      };
    }

    // Handle single status filter (backward compatibility)
    if (filters.taskStatusId) {
      whereClause.taskStatusId = filters.taskStatusId;
    }

    // Handle multiple status filters (new feature)
    if (filters.taskStatusIds && filters.taskStatusIds.length > 0) {
      whereClause.taskStatusId = {
        in: filters.taskStatusIds,
      };
    }

    // Handle single priority filter (backward compatibility)
    if (filters.taskPriorityId) {
      whereClause.taskPriorityId = filters.taskPriorityId;
    }

    // Handle multiple priority filters (new feature)
    if (filters.taskPriorityIds && filters.taskPriorityIds.length > 0) {
      whereClause.taskPriorityId = {
        in: filters.taskPriorityIds,
      };
    }

    // Handle single initiative filter (backward compatibility)
    if (filters.taskInitiativeId) {
      whereClause.taskInitiativeId = filters.taskInitiativeId;
    }

    // Handle multiple initiative filters (new feature)
    if (filters.taskInitiativeIds && filters.taskInitiativeIds.length > 0) {
      whereClause.taskInitiativeId = {
        in: filters.taskInitiativeIds,
      };
    }

    if (filters.sprint) {
      whereClause.sprint = filters.sprint;
    }

    if (filters.featureCategories) {
      whereClause.featureCategories = filters.featureCategories;
    }

    if (filters.createdById) {
      whereClause.createdById = filters.createdById;
    }

    // Handle due date range filters
    if (filters.dueDateFrom || filters.dueDateTo) {
      whereClause.dueDate = {};

      if (filters.dueDateFrom) {
        whereClause.dueDate.gte = new Date(filters.dueDateFrom);
      }

      if (filters.dueDateTo) {
        whereClause.dueDate.lte = new Date(filters.dueDateTo);
      }
    }

    // Handle overdue filter (this should not conflict with date range filters)
    if (filters.isOverdue && !filters.dueDateFrom && !filters.dueDateTo) {
      whereClause.dueDate = {
        lt: new Date(),
      };
      whereClause.taskStatus = {
        title: {
          not: {
            contains: 'Done',
          },
        },
      };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await this.prisma.task.count({
      where: whereClause,
    });

    // Get paginated tasks
    const tasks = await this.prisma.task.findMany({
      where: whereClause,
      include: {
        taskStatus: true,
        taskPriority: true,
        taskInitiative: true,
        assignee: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        baUser: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        taskMembers: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullname: true,
                publicName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            position: 'asc',
          },
        },
        _count: {
          select: {
            taskMembers: true,
            taskComments: true,
            taskHistory: true,
          },
        },
      },
      orderBy: this.buildOrderBy(filters.sortBy, filters.sortOrder) as any,
      skip,
      take: limit,
    });

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findFirst({
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
        taskStatus: true,
        taskPriority: true,
        taskInitiative: true,
        assignee: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        baUser: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        taskMembers: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullname: true,
                publicName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            position: 'asc',
          },
        },
        taskHistory: {
          include: {
            changedBy: {
              select: {
                id: true,
                email: true,
                fullname: true,
                publicName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            version: 'desc',
          },
        },
        taskComments: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
                fullname: true,
                publicName: true,
                avatarUrl: true,
              },
            },
            _count: {
              select: {
                commentReactions: true,
                commentMentions: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        _count: {
          select: {
            taskMembers: true,
            taskComments: true,
            taskHistory: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async findByUser(
    targetUserId: string,
    currentUserId: string,
    filters: TaskFiltersDto = {},
  ) {
    // Check if current user has access to any workspace where target user is a member
    const hasAccess = await this.prisma.workspaceMember.findFirst({
      where: {
        userId: currentUserId,
        workspace: {
          members: {
            some: {
              userId: targetUserId,
            },
          },
        },
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied to user tasks');
    }

    // Build where clause with filters
    const whereClause: any = {
      OR: [
        { assigneeId: targetUserId },
        { reviewerId: targetUserId },
        { baId: targetUserId },
        { createdById: targetUserId },
        {
          taskMembers: {
            some: {
              userId: targetUserId,
            },
          },
        },
      ],
      board: {
        workspace: {
          members: {
            some: {
              userId: currentUserId,
            },
          },
        },
      },
    };

    // Add additional filters if provided
    if (filters.taskStatusId) {
      whereClause.taskStatusId = filters.taskStatusId;
    }

    if (filters.taskPriorityId) {
      whereClause.taskPriorityId = filters.taskPriorityId;
    }

    if (filters.taskInitiativeId) {
      whereClause.taskInitiativeId = filters.taskInitiativeId;
    }

    if (filters.sprint) {
      whereClause.sprint = filters.sprint;
    }

    if (filters.featureCategories) {
      whereClause.featureCategories = filters.featureCategories;
    }

    // Handle overdue filter
    if (filters.isOverdue) {
      whereClause.dueDate = {
        lt: new Date(),
      };
      whereClause.taskStatus = {
        title: {
          not: {
            contains: 'Done',
          },
        },
      };
    }

    return this.prisma.task.findMany({
      where: whereClause,
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
        taskStatus: true,
        taskPriority: true,
        taskInitiative: true,
        assignee: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        baUser: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        taskMembers: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullname: true,
                publicName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            position: 'asc',
          },
        },
        _count: {
          select: {
            taskMembers: true,
            taskComments: true,
            taskHistory: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    // First get the task to check board access
    const existingTask = await this.prisma.task.findFirst({
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

    if (!existingTask) {
      throw new NotFoundException('Task not found');
    }

    // Check if user has permission to update task
    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: existingTask.board.workspaceId,
        userId,
        role: {
          in: [
            WorkspaceMemberRole.owner,
            WorkspaceMemberRole.manager,
            WorkspaceMemberRole.member,
          ],
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('Insufficient permissions to update task');
    }

    // Validate related entities if provided
    if (updateTaskDto.taskStatusId) {
      const taskStatus = await this.prisma.taskStatus.findFirst({
        where: {
          id: updateTaskDto.taskStatusId,
          boardId: existingTask.boardId,
        },
      });
      if (!taskStatus) {
        throw new BadRequestException('Invalid task status for this board');
      }
    }

    if (updateTaskDto.taskPriorityId) {
      const taskPriority = await this.prisma.taskPriority.findFirst({
        where: {
          id: updateTaskDto.taskPriorityId,
          boardId: existingTask.boardId,
        },
      });
      if (!taskPriority) {
        throw new BadRequestException('Invalid task priority for this board');
      }
    }

    if (updateTaskDto.taskInitiativeId) {
      const taskInitiative = await this.prisma.taskInitiative.findFirst({
        where: {
          id: updateTaskDto.taskInitiativeId,
          boardId: existingTask.boardId,
        },
      });
      if (!taskInitiative) {
        throw new BadRequestException('Invalid task initiative for this board');
      }
    }

    // Validate assignee, reviewer, and BA if provided
    if (updateTaskDto.assigneeId) {
      const assignee = await this.prisma.workspaceMember.findFirst({
        where: {
          workspaceId: existingTask.board.workspaceId,
          userId: updateTaskDto.assigneeId,
        },
      });
      if (!assignee) {
        throw new BadRequestException(
          'Assignee is not a member of the workspace',
        );
      }
    }

    if (updateTaskDto.reviewerId) {
      const reviewer = await this.prisma.workspaceMember.findFirst({
        where: {
          workspaceId: existingTask.board.workspaceId,
          userId: updateTaskDto.reviewerId,
        },
      });
      if (!reviewer) {
        throw new BadRequestException(
          'Reviewer is not a member of the workspace',
        );
      }
    }

    if (updateTaskDto.baId) {
      const baUser = await this.prisma.workspaceMember.findFirst({
        where: {
          workspaceId: existingTask.board.workspaceId,
          userId: updateTaskDto.baId,
        },
      });
      if (!baUser) {
        throw new BadRequestException(
          'BA user is not a member of the workspace',
        );
      }
    }

    // Get the latest version number
    const latestHistory = await this.prisma.taskHistory.findFirst({
      where: { taskId: id },
      orderBy: { version: 'desc' },
    });

    const newVersion = latestHistory ? latestHistory.version + 1 : 1;

    // Prepare update data
    const updateData: any = { ...updateTaskDto };
    if (updateTaskDto.dueDate) {
      updateData.dueDate = new Date(updateTaskDto.dueDate);
    }
    if (updateTaskDto.goLive) {
      updateData.goLive = new Date(updateTaskDto.goLive);
    }

    const task = await this.prisma.task.update({
      where: { id },
      data: updateData,
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
        taskStatus: true,
        taskPriority: true,
        taskInitiative: true,
        assignee: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        baUser: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            fullname: true,
            publicName: true,
            avatarUrl: true,
          },
        },
        taskMembers: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullname: true,
                publicName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            position: 'asc',
          },
        },
        _count: {
          select: {
            taskMembers: true,
            taskComments: true,
            taskHistory: true,
          },
        },
      },
    });

    // Create history record for the update
    await this.prisma.taskHistory.create({
      data: {
        taskId: task.id,
        version: newVersion,
        changedById: userId,
        changedAt: new Date(),
        title: task.title,
        dueDate: task.dueDate,
        taskStatusId: task.taskStatusId,
        taskInitiativeId: task.taskInitiativeId,
        taskPriorityId: task.taskPriorityId,
        okr: task.okr,
        assigneeId: task.assigneeId,
        reviewerId: task.reviewerId,
        storyPoint: task.storyPoint,
        sizeCard: task.sizeCard,
        testCase: task.testCase,
        goLive: task.goLive,
        devMr: task.devMr,
        baId: task.baId,
        staging: task.staging,
        note: task.note,
        createdById: task.createdById,
        createdTime: task.createdTime,
        sprint: task.sprint,
        featureCategories: task.featureCategories,
        sprintGoal: task.sprintGoal,
        descriptionJson: task.descriptionJson as any,
        descriptionPlain: task.descriptionPlain,
        noteJson: task.noteJson as any,
        notePlain: task.notePlain,
        attachments: task.attachments as any,
      },
    });

    return task;
  }

  async remove(id: string, userId: string) {
    // First get the task to check board access
    const task = await this.prisma.task.findFirst({
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

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user has permission to delete task
    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: task.board.workspaceId,
        userId,
        role: {
          in: [WorkspaceMemberRole.owner, WorkspaceMemberRole.manager],
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('Insufficient permissions to delete task');
    }

    await this.prisma.task.delete({
      where: { id },
    });

    return { message: 'Task deleted successfully' };
  }

  async getTaskStats(boardId: string, userId: string) {
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

    const [
      totalTasks,
      completedTasks,
      overdueTasks,
      tasksByStatus,
      tasksByPriority,
      tasksByInitiative,
    ] = await Promise.all([
      this.prisma.task.count({
        where: { boardId },
      }),
      this.prisma.task.count({
        where: {
          boardId,
          taskStatus: {
            title: {
              contains: 'Done',
            },
          },
        },
      }),
      this.prisma.task.count({
        where: {
          boardId,
          dueDate: {
            lt: new Date(),
          },
          taskStatus: {
            title: {
              not: {
                contains: 'Done',
              },
            },
          },
        },
      }),
      this.prisma.task.groupBy({
        by: ['taskStatusId'],
        where: { boardId },
        _count: {
          id: true,
        },
      }),
      this.prisma.task.groupBy({
        by: ['taskPriorityId'],
        where: { boardId },
        _count: {
          id: true,
        },
      }),
      this.prisma.task.groupBy({
        by: ['taskInitiativeId'],
        where: { boardId },
        _count: {
          id: true,
        },
      }),
    ]);

    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      tasksByStatus,
      tasksByPriority,
      tasksByInitiative,
    };
  }
}
