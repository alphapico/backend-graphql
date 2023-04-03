import { HttpException, HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';

// interface IValidationError {
//   property: string;
//   constraints: {
//     [type: string]: string;
//   };
// }

export class ClassValidationException extends HttpException {
  constructor(errors: ValidationError[]) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        errors: errors.map((error) => ({
          property: error.property,
          constraints: error.constraints,
        })),
      },
      HttpStatus.BAD_REQUEST
    );
  }
}
