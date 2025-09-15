import {
  IsString,
  IsOptional,
  IsObject,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCommentAttachmentDto {
  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  fileSize?: number;

  @IsOptional()
  @IsString()
  fileType?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;
}

export class UpdateTaskCommentDto {
  @IsOptional()
  @IsObject()
  contentJson?: any;

  @IsOptional()
  @IsString()
  contentPlain?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCommentAttachmentDto)
  attachments?: UpdateCommentAttachmentDto[];
}
