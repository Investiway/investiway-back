import { plainToClass } from 'class-transformer';
import { ICaslHandler } from '../../guards/casl.guard';
import { CaslAction } from '../casl.enum';
import { AppAbility } from '../casl.factory';
import { Request } from 'express';

export class MatchFieldRequestCasl<V, T> implements ICaslHandler {
  private clazz: { new (): T };
  private type: 'query' | 'body';
  private keyInModel: keyof T;
  private keyInRequest: keyof V;
  private action: CaslAction;

  constructor(
    action: CaslAction,
    clazz: { new (): T },
    type: 'query' | 'body',
    keyInModel: keyof T,
    keyInRequest: keyof V,
  ) {
    this.clazz = clazz;
    this.action = action;
    this.type = type;
    this.keyInModel = keyInModel;
    this.keyInRequest = keyInRequest;
  }

  handle(ability: AppAbility, request: Request): boolean {
    const data = request[this.type] as V;
    return ability.can(
      this.action,
      plainToClass(this.clazz as any, {
        [this.keyInModel]: data[this.keyInRequest],
      }),
    );
  }
}
