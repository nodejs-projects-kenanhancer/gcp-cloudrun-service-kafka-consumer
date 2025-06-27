export abstract class EnvConfigProcessor {
  abstract process<TResult = Record<string, any>>(
    envConfig: Record<string, string>,
  ): TResult;
}
