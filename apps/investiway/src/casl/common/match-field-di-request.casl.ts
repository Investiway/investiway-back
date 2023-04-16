import { plainToClass } from 'class-transformer';
import { ICaslHandler } from '../../guards/casl.guard';
import { CaslAction } from '../casl.enum';
import { AppAbility } from '../casl.factory';
import { Request } from 'express';
import { ModuleRef } from '@nestjs/core';
import { PromiseLike } from 'src/types/common';

export class MatchFieldInjectRequestCasl<T, V> implements ICaslHandler {
  private clazz: { new (): T };
  private action: CaslAction;
  private keysCompare: { clazz: keyof T; func: keyof V }[];
  private diFunc: (...args: any[]) => PromiseLike<V>;

  /**
   * It build casl ability
   *  ability.can(
   *    action,
   *    <clazz>{
   *      [kClazz]: func(...injects)[kModel]
   *    }
   *  )
   * @param action CaslAction
   * @param clazz Model
   * @param keysCompare { clazz: keyInModel, func: keyInFunc() }[]
   */
  constructor(
    action: CaslAction,
    clazz: { new (): T },
    keysCompare: { clazz: keyof T; func: keyof V }[],
    diFunc: (...args: any[]) => PromiseLike<V>,
  ) {
    this.clazz = clazz;
    this.action = action;
    this.keysCompare = keysCompare;
    this.diFunc = diFunc;
  }

  async handle(ability: AppAbility, request: Request, moduleRef: ModuleRef) {
    const funcParams = Reflect.getMetadata(
      'design:paramtypes',
      this.diFunc,
    ) as any[];
    console.log(this.diFunc, funcParams);
    const diParams = funcParams.slice(-1).map((param) => moduleRef.get(param));
    const data = await this.diFunc(...diParams, request);
    const clazzModel = this.keysCompare.reduce((val, item) => {
      val[item.clazz] = data[item.func];
      return val;
    }, {} as any) as T;
    return ability.can(
      this.action,
      plainToClass(this.clazz as any, clazzModel),
    );
  }
}
