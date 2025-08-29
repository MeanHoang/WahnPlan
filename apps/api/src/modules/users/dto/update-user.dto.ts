import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Full name must not exceed 100 characters' })
  fullname?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Public name must not exceed 50 characters' })
  publicName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Job title must not exceed 100 characters' })
  jobTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Organization must not exceed 100 characters' })
  organization?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Location must not exceed 100 characters' })
  location?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
