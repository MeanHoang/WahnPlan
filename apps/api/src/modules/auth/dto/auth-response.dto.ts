export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    fullname: string | null;
    publicName?: string | null;
    avatarUrl?: string | null;
    emailVerify: boolean;
  };
}
