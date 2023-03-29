import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAppAuthGuard extends AuthGuard('jwt-app') {}
