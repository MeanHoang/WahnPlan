import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-workspaces')
  testWorkspaces() {
    return {
      message: 'API is working!',
      timestamp: new Date().toISOString(),
      endpoints: {
        workspaces: '/api/workspaces',
        workspaceStats: '/api/workspaces/stats',
      },
    };
  }
}
