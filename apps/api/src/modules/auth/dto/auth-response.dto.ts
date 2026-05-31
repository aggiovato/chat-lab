import { UserResponseDto } from '../../users/dto/user-response.dto';

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;

  constructor(accessToken: string, refreshToken: string, user: UserResponseDto) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.user = user;
  }
}
