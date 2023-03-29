import {Controller, Get, HttpStatus, Req, Res, UnauthorizedException, UseGuards, Version} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {AuthService} from "../services/auth.service";
import {AuthGuard} from "@nestjs/passport";
import {Request, Response} from "express";
import {plainToClass} from "class-transformer";
import {FacebookAuthDto} from "../dtos/auth.dto";

@Controller({
  version: '1',
  path: 'auth',
})
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) {}

  @Get('access')
  @UseGuards(AuthGuard('jwt-access'))
  async accessLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refreshLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get('facebook_redirect')
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginRedirect(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    const user = req.user?.['user'];
    const token = await this.authService.loginWithFacebook(plainToClass(FacebookAuthDto, {
      facebookId: user['googleId'],
      email: user['email'],
      lastName: user['lastName'],
      firstName: user['firstName'],
    }));
    if (!token) {
      return new UnauthorizedException();
    }
    res.redirect(this.authService.createFeUrlRedirect(token));
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google_redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req: Request) {
    console.log(req.query);
    return true;
  }
}