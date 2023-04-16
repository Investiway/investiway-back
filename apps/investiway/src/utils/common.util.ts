import { plainToClass } from 'class-transformer';
import { Types } from 'mongoose';

export const convert = <T>(c: any) => c as T;

export const convertToObjectId = <T>(data: T, ...keys: (keyof T)[]) => {
  return keys.reduce((val, item) => {
    val[item] = new Types.ObjectId(val[item] as string) as any;
    return val;
  }, data);
};

export const caslObject2String = <T>(
  clazz: { new (): T },
  data: T,
  ...keys: (keyof T)[]
) => {
  const on = keys.reduce((val, item) => {
    val[item] = val[item].toString() as any;
    return val;
  }, data);
  return plainToClass(clazz, on);
};
