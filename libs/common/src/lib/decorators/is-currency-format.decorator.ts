import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ERROR_MESSAGES } from '../constants';

@ValidatorConstraint({ async: false })
export class IsCurrencyFormatConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any): boolean {
    // Regular expression to match valid currency formats
    const regex = /^\d+(\.\d{1,2})?$/;
    return typeof value === 'number' && regex.test(value.toString());
  }

  defaultMessage(): string {
    return ERROR_MESSAGES.VAL.IS_CURRENCY_FORMAT;
  }
}

export function IsCurrencyFormat(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsCurrencyFormat',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: IsCurrencyFormatConstraint,
    });
  };
}
