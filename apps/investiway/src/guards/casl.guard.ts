import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { AppAbility, CaslAppFactory } from '../casl/casl.factory';
import { Request } from 'express';
import { PromiseLike } from 'src/types/common';

export interface ICaslHandler {
  handle(
    ability: AppAbility,
    request: Request,
    moduleRef: ModuleRef,
  ): PromiseLike<boolean>;
}

type CaslHandlerCallback = (
  ability: AppAbility,
  request: Request,
) => PromiseLike<boolean>;

export type CaslHandler = ICaslHandler | CaslHandlerCallback;
export const CHECK_CASL_KEY = 'check_casl';
export const CheckCasl = (...handlers: CaslHandler[]) =>
  SetMetadata(CHECK_CASL_KEY, handlers);

@Injectable()
export class CaslGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAppFactory: CaslAppFactory,
    private moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<CaslHandler[]>(CHECK_CASL_KEY, context.getHandler()) ||
      [];

    const request = context.switchToHttp().getRequest() as Request;
    const { user } = request as any;
    const ability = this.caslAppFactory.createForUser(user);

    for (const handler of policyHandlers) {
      const r = await this.execPolicyHandler(handler, ability, request);
      if (!r) {
        return false;
      }
    }
    return true;
  }

  private execPolicyHandler(
    handler: CaslHandler,
    ability: AppAbility,
    request: Request,
  ) {
    if (typeof handler === 'function') {
      return handler(ability, request);
    }
    return handler.handle(ability, request, this.moduleRef);
  }
}
