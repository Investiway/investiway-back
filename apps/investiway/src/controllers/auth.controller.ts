import {
  Controller,
  Get,
  HttpStatus,
  Logger,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {AuthService} from "../services/auth.service";
import {AuthGuard} from "@nestjs/passport";
import {Request, Response} from "express";
import {plainToClass} from "class-transformer";
import {AccessResponse, FacebookAuthDto, GoogleAuthDto, RefreshResponse} from "../dtos/auth.dto";
import {EAuthError} from "../constants/auth.constant";
import {ApiBearerAuth, ApiHeader, ApiOperation, ApiTags, ApiUnauthorizedResponse} from "@nestjs/swagger";
import {ResponseIntercept} from "../intercepts/response.intercept";
import {GoogleGuard} from "../guards/google.guard";
import {FacebookGuard} from "../guards/facebook.guard";
import {ApiErrorResponse, ApiSuccessResponse} from "../decorators/response.decorator";

@Controller({
  version: '1',
  path: 'auth',
})
@ApiTags('auth')
export class AuthController {
  private log = new Logger(AuthController.name);
  
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) {}

  @Get('access')
  @UseGuards(AuthGuard('jwt-access'))
  @UseInterceptors(ResponseIntercept)
  @ApiBearerAuth()
  @ApiSuccessResponse(AccessResponse)
  @ApiErrorResponse(ApiUnauthorizedResponse)
  async accessLogin(@Req() req: Request): Promise<any> {
    return (req as any).user;
  }

  @Get('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @UseInterceptors(ResponseIntercept)
  @ApiBearerAuth()
  @ApiSuccessResponse(RefreshResponse)
  @ApiErrorResponse(ApiUnauthorizedResponse)
  @ApiHeader({ name: 'Authorization', description: 'Refresh token (Need Bearer)', required: true })
  async refreshLogin(@Req() req: Request): Promise<any> {
    const user = (req as any).user;
    const accessToken = await this.authService.signAccess(user._id);
    return { accessToken };
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Login with facebook' })
  async facebookLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get('facebook_redirect')
  @UseGuards(FacebookGuard)
  @ApiOperation({ summary: 'Callback facebook (own BE)' })
  async facebookLoginRedirect(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const user = (req as any).user?.['user'];
      const token = await this.authService.loginWithSocial(plainToClass(FacebookAuthDto, {
        facebookId: user['facebookId'],
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
  @ApiOperation({ summary: 'Login with google' })
  async googleAuth() {}

  @Get('google_redirect')
  @ApiOperation({ summary: 'Callback google (own BE)' })
  @UseGuards(GoogleGuard)
  async googleAuthRedirect(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const user = (req as any).user;
      const token = await this.authService.loginWithSocial(plainToClass(GoogleAuthDto, {
        googleId: user['email'],
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
}