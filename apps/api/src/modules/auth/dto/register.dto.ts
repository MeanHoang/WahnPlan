import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Full name must not exceed 100 characters' })
  fullname: string;

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
}
