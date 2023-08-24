import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CONFIG, ERROR_MESSAGES } from '../constants';

@ValidatorConstraint({ async: false })
export class IsSupportedCurrencyConstraint
  implements ValidatorConstraintInterface
{
  validate(currency: any) {
    const supportedCurrencies = CONFIG.COINBASE_SUPPORTED_FIAT;
    return supportedCurrencies.includes(currency);
  }

  defaultMessage() {
    return ERROR_MESSAGES.VAL.IS_SUPPORTED_CURRENCY;
  }
}

export function IsSupportedCurrency(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsSupportedCurrencyConstraint,
    });
  };
}
