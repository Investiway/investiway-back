import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isObjectId', async: false })
export class IsObjectIdValidate implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    return !text || /^[0-9a-fA-F]{24}$/.test(text);
  }

  defaultMessage(args: ValidationArguments) {
    return 'ObjectId failed';
  }
}

export function IsObjectId<T, K>(
  field?: K,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isObjectId',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsObjectIdValidate,
      constraints: [field],
    });
  };
}
