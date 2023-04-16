import { plainToClass } from 'class-transformer';
import { ICaslHandler } from '../../guards/casl.guard';
import { CaslAction } from '../casl.enum';
import { AppAbility } from '../casl.factory';
import { Request } from 'express';
import { PromiseLike } from 'src/types/common';

export class MatchFieldRequestCasl<V, T> implements ICaslHandler {
  private clazz: { new (): T };
  private type: keyof Request;
  private action: CaslAction;
  private keysCompare: { clazz: keyof T; request: keyof V }[];

  /**
   * It build casl ability
   *  ability.can(action, <clazz>{ [kClazz]: request[type][kRequest]  })
   * @param action CaslAction
   * @param clazz Model
   * @param type request[type] ex: 'query' | 'body' ...
   * @param keysCompare { clazz: keyInModel, request: keyIn request[type] }[]
   */
  constructor(
    action: CaslAction,
    clazz: { new (): T },
    type: keyof Request,
    keysCompare: { clazz: keyof T; request: keyof V }[],
  ) {
    this.clazz = clazz;
    this.action = action;
    this.type = type;
    this.keysCompare = keysCompare;
  }

  handle(ability: AppAbility, request: Request): PromiseLike<boolean> {
    const data = request[this.type] as V;
    const clazzModel = this.keysCompare.reduce((val, item) => {
      val[item.clazz] = data[item.request];
      return val;
    }, {} as any) as T;
    return ability.can(
      this.action,
      plainToClass(this.clazz as any, clazzModel),
    );
  }
}
