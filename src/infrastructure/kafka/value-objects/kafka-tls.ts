export class KafkaTls {
  constructor(
    readonly rejectUnauthorized: boolean,
    readonly ca: string,
    readonly cert: string,
    readonly key: string,
    readonly username: string,
    readonly password: string,
  ) {}
}
