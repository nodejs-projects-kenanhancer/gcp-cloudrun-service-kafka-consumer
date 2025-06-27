import { ErrorType } from './error-types.enum';

export abstract class BaseError extends Error {
  constructor(
    message: string,
    public readonly errorType: ErrorType,
  ) {
    super(message);
    this.name = this.constructor.name;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
