import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboardData(@Req() req: any) {
    return this.analyticsService.getDashboardData();
  }

  @Get('user-growth')
  async getUserGrowth() {
    return this.analyticsService.getUserGrowth();
  }

  @Get('task-distribution')
  async getTaskDistribution() {
    return this.analyticsService.getTaskDistribution();
  }

  @Get('task-priority-distribution')
  async getTaskPriorityDistribution() {
    return this.analyticsService.getTaskPriorityDistribution();
  }

  @Get('task-initiative-distribution')
  async getTaskInitiativeDistribution() {
    return this.analyticsService.getTaskInitiativeDistribution();
  }

  @Get('recent-activities')
  async getRecentActivities() {
    return this.analyticsService.getRecentActivities();
  }

  @Get('workspace-stats')
  async getWorkspaceStats() {
    return this.analyticsService.getWorkspaceStats();
  }

  @Get('task-completion-trend')
  async getTaskCompletionTrend() {
    return this.analyticsService.getTaskCompletionTrend();
  }
}
