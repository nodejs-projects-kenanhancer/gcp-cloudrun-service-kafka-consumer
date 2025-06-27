export class KafkaTlsSecretSettings {
  constructor(
    readonly rejectUnauthorized: boolean,
    readonly caCertSecretName: string,
    readonly certSecretName: string,
    readonly keySecretName: string,
    readonly usernameSecretName: string,
    readonly passwordSecretName: string,
  ) {}
}
