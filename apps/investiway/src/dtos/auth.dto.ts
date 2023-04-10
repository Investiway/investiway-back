import {ApiProperty} from "@nestjs/swagger";

export class CommonAuthDto {
  email: string;
  lastName: string;
  firstName: string;
}

export class GoogleAuthDto extends CommonAuthDto {
  googleId: string;
}

export class FacebookAuthDto extends CommonAuthDto {
  facebookId: string;
}

export class TokenGroup {
  accessToken: string;
  refreshToken: string;
}

export class JwtPayload {
  id: string
}

export class AccessResponse {
  @ApiProperty()
  test: number;
}