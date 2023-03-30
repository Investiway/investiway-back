import {Controller, Get, HttpStatus, Logger, Req, Res, UnauthorizedException, UseGuards, Version} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {AuthService} from "../services/auth.service";
import {AuthGuard} from "@nestjs/passport";
import {Request, Response} from "express";
import {plainToClass} from "class-transformer";
import {FacebookAuthDto} from "../dtos/auth.dto";
import {EAuthError} from "../constants/auth.constant";
import {ApiBearerAuth} from "@nestjs/swagger";

@Controller({
  version: '1',
  path: 'auth',
})
export class AuthController {
  private log = new Logger(AuthController.name);
  
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) {}

  @Get('access')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiBearerAuth()
  async accessLogin(@Req() req: Request): Promise<any> {
    return (req as any).user;
  }

  @Get('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiBearerAuth()
  async refreshLogin(@Req() req: Request): Promise<any> {
    const user = (req as any).user;
    const accessToken = await this.authService.signAccess(user._id);
    return { accessToken };
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
    try {
      const user = (req as any).user?.['user'];
      const token = await this.authService.loginWithFacebook(plainToClass(FacebookAuthDto, {
        facebookId: user['googleId'],
        email: user['email'],
        lastName: user['lastName'],
        firstName: user['firstName'],
      }));
      if (!token) {
        res.redirect(this.authService.createFeUrlErrorRedirect(EAuthError.Unauthorization));
        return ;
      }
      res.redirect(this.authService.createFeUrlRedirect(token));
    } catch (e) {
      this.log.error(e);
      res.redirect(this.authService.createFeUrlErrorRedirect(EAuthError.InternalServer));
    }
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