import { BaseError } from './base.error';
import { ErrorType } from './error-types.enum';

export class ProjectMetadataError extends BaseError {
  constructor(message: string) {
    super(message, ErrorType.PROJECT_METADATA);
  }
}
