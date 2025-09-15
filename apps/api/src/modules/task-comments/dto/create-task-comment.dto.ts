import {
  IsString,
  IsOptional,
  IsObject,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCommentAttachmentDto {
  @IsString()
  fileName: string;

  @IsString()
  fileUrl: string;

  @IsOptional()
  fileSize?: number;

  @IsString()
  fileType: string;

  @IsString()
  mimeType: string;
}

export class CreateCommentMentionDto {
  @IsString()
  mentionedUserId: string;
}

export class CreateTaskCommentDto {
  @IsString()
  taskId: string;

  @IsObject()
  contentJson: any;

  @IsString()
  contentPlain: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCommentAttachmentDto)
  attachments?: CreateCommentAttachmentDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCommentMentionDto)
  mentions?: CreateCommentMentionDto[];
}
