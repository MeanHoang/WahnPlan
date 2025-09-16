import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { WorkspaceMemberRole } from '@prisma/client';

@Injectable()
export class CommentReactionsService {
  constructor(private prisma: PrismaService) {}

  async addReaction(commentId: string, emoji: string, userId: string) {
    // Validate emoji
    if (!emoji || emoji.trim().length === 0) {
      throw new BadRequestException('Emoji is required');
    }

    // Check if user has access to the comment
    const comment = await this.prisma.taskComment.findFirst({
      where: {
        id: commentId,
        task: {
          board: {
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
        },
      },
      include: {
        commentReactions: {
          where: {
            userId,
            emoji,
          },
        },
      },
    });

    if (!comment) {
      throw new ForbiddenException(
        'Insufficient permissions to react to this comment',
      );
    }

    // Check if reaction already exists
    const existingReaction = comment.commentReactions[0];

    if (existingReaction) {
      // Remove existing reaction (toggle off)
      await this.prisma.commentReaction.delete({
        where: {
          commentId_userId_emoji: {
            commentId,
            userId,
            emoji,
          },
        },
      });
      return {
        message: 'Reaction removed',
        action: 'removed',
        emoji,
        commentId,
      };
    } else {
      // Add new reaction (toggle on)
      await this.prisma.commentReaction.create({
        data: {
          commentId,
          userId,
          emoji,
        },
      });
      return {
        message: 'Reaction added',
        action: 'added',
        emoji,
        commentId,
      };
    }
  }

  async getReactions(commentId: string, userId: string) {
    // Check if user has access to the comment
    const comment = await this.prisma.taskComment.findFirst({
      where: {
        id: commentId,
        task: {
          board: {
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
        },
      },
    });

    if (!comment) {
      throw new ForbiddenException(
        'Insufficient permissions to view reactions for this comment',
      );
    }

    // Get all reactions for this comment
    const reactions = await this.prisma.commentReaction.findMany({
      where: {
        commentId,
      },
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
        createdAt: 'asc',
      },
    });

    return reactions;
  }

  async removeReaction(commentId: string, emoji: string, userId: string) {
    // Check if user has access to the comment
    const comment = await this.prisma.taskComment.findFirst({
      where: {
        id: commentId,
        task: {
          board: {
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
        },
      },
    });

    if (!comment) {
      throw new ForbiddenException(
        'Insufficient permissions to remove reaction from this comment',
      );
    }

    // Remove the reaction
    const deletedReaction = await this.prisma.commentReaction.deleteMany({
      where: {
        commentId,
        userId,
        emoji,
      },
    });

    if (deletedReaction.count === 0) {
      throw new NotFoundException('Reaction not found');
    }

    return {
      message: 'Reaction removed successfully',
      action: 'removed',
      emoji,
      commentId,
    };
  }

  async getReactionStats(commentId: string, userId: string) {
    // Check if user has access to the comment
    const comment = await this.prisma.taskComment.findFirst({
      where: {
        id: commentId,
        task: {
          board: {
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
        },
      },
    });

    if (!comment) {
      throw new ForbiddenException(
        'Insufficient permissions to view reaction stats for this comment',
      );
    }

    // Get reaction statistics grouped by emoji
    const reactionStats = await this.prisma.commentReaction.groupBy({
      by: ['emoji'],
      where: {
        commentId,
      },
      _count: {
        emoji: true,
      },
      orderBy: {
        _count: {
          emoji: 'desc',
        },
      },
    });

    // Get user's reactions for this comment
    const userReactions = await this.prisma.commentReaction.findMany({
      where: {
        commentId,
        userId,
      },
      select: {
        emoji: true,
      },
    });

    return {
      stats: reactionStats.map((stat) => ({
        emoji: stat.emoji,
        count: stat._count.emoji,
      })),
      userReactions: userReactions.map((reaction) => reaction.emoji),
    };
  }
}
