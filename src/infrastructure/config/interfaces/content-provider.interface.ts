export interface ContentProvider {
  getContent(): Promise<string>;
}
