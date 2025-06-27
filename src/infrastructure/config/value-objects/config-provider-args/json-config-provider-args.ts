import { ConfigProviderArgs } from '../../interfaces';

export class JsonConfigProviderArgs extends ConfigProviderArgs {
  readonly type = 'file-json';

  constructor(readonly filePath: string) {
    super();
  }
}
