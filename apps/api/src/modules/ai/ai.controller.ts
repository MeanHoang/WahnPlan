import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { GenerateDescriptionDto } from './dto/generate-description.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-description')
  async generateDescription(@Body() body: GenerateDescriptionDto) {
    try {
      const description = await this.aiService.generateTaskDescription(
        body.taskTitle,
        body.boardTitle,
        body.boardSubtitle,
        body.taskNotes,
      );
      return { description };
    } catch (error: any) {
      const msg: string = error?.message || '';

      if (msg === 'AI_QUOTA_EXCEEDED') {
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message:
              'AI quota exceeded or rate limited. Please try again later.',
            error: 'Too Many Requests',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      if (msg === 'AI_MISSING_API_KEY' || msg === 'AI_INVALID_API_KEY') {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message:
              msg === 'AI_INVALID_API_KEY'
                ? 'Invalid AI API Key provided.'
                : 'Missing AI API key in server environment.',
            error: 'Bad Request',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (msg.startsWith('AI_HTTP_')) {
        const afterPrefix = msg.substring('AI_HTTP_'.length);
        const colonIdx = afterPrefix.indexOf(':');
        const statusStr =
          colonIdx >= 0 ? afterPrefix.substring(0, colonIdx) : afterPrefix;
        const statusNum = Number(statusStr) || HttpStatus.INTERNAL_SERVER_ERROR;
        const providerMessage =
          colonIdx >= 0
            ? afterPrefix.substring(colonIdx + 1).trim()
            : 'AI provider error';
        throw new HttpException(
          {
            statusCode: statusNum,
            message: providerMessage || 'AI provider error',
            error: 'AI Provider Error',
          },
          statusNum,
        );
      }

      if (msg === 'AI_GENERATION_FAILED') {
        throw new HttpException(
          {
            statusCode: HttpStatus.SERVICE_UNAVAILABLE,
            message: 'AI temporarily unavailable. Please try again shortly.',
            error: 'Service Unavailable',
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to generate description from AI.',
          error: 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
