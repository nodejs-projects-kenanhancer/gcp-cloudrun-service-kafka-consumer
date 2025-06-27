export abstract class ConfigProvider<T = Record<string, any>> {
  abstract getConfig(): Promise<T>;
}
