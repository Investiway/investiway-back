import {
  BadGatewayException,
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable, InternalServerErrorException, Logger,
  NestInterceptor
} from "@nestjs/common";
import {catchError, map, Observable, throwError} from "rxjs";
import {ResponseDto} from "../dtos/response.dto";

@Injectable()
export class ResponseIntercept implements NestInterceptor {
  private readonly logger  = new Logger();
  
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    return next.handle()
      .pipe(catchError((e) => {
        this.logger.error(e.stack || e);
        try {
          const r = e.getResponse();
          const s = e.getStatus();
          const response: ResponseDto<any> = {
            success: false,
            error: r
          }
          return throwError(new HttpException(response, s));
        } catch (e) {
          return throwError(new InternalServerErrorException());
        } 
      }))
      .pipe(map((data) => {
        const response: ResponseDto<typeof  data> = {
          result: data,
          success: true
        }
        return response;
      }));
  }
}