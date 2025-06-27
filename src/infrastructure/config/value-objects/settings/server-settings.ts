import { LogLevel } from '../../enums';

export interface ServerSettings {
  readonly port: number;
  readonly logLevel: LogLevel;
}
