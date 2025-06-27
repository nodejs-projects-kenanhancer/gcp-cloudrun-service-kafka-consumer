import { Environment } from '../../enums';

export class BasicSettings {
  constructor(
    readonly environment: Environment,
    readonly gcpProjectId: string,
    readonly gcpProjectNumber: string,
    readonly gcpServiceName: string,
    readonly appConfigBucket: string,
  ) {}
}
