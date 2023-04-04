import {ExecutionContext, Injectable} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";
import {AuthService} from "../services/auth.service";
import {Request, Response} from "express";
import {EAuthError} from "../constants/auth.constant";

@Injectable()
export class FacebookGuard extends AuthGuard("facebook") {
  constructor(
    private readonly authService: AuthService
  ) {
    super();
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any) {
    if (err || !user) {
      const [req, res]: [Request, Response] = context.getArgs();
      let code: EAuthError = EAuthError.InternalServer;
      if (err.status === 401) {
        code = EAuthError.Unauthorization;
      }
      res.redirect(this.authService.createFeUrlErrorRedirect(code))
    }
    return user;
  }
}