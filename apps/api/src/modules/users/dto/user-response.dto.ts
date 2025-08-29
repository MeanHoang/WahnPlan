export class UserResponseDto {
  id: string;
  email: string;
  fullname: string;
  publicName?: string;
  jobTitle?: string;
  organization?: string;
  location?: string;
  avatarUrl?: string;
  emailVerify: boolean;
  language: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}
