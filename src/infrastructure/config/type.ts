// import { ConfigProviderType } from '../interfaces';
// import {
//   EnvConfigProviderArgs,
//   GcpSecretEnvConfigProviderArgs,
//   GcpSecretJsonConfigProviderArgs,
//   GcpSecretYamlConfigProviderArgs,
//   GcpStorageEnvConfigProviderArgs,
//   GcpStorageJsonConfigProviderArgs,
//   GcpStorageYamlConfigProviderArgs,
//   JsonConfigProviderArgs,
//   YamlConfigProviderArgs,
// } from './config-provider-args';

// export type AllConfigProviderArgs =
//   | EnvConfigProviderArgs
//   | JsonConfigProviderArgs
//   | YamlConfigProviderArgs
//   | GcpStorageEnvConfigProviderArgs
//   | GcpStorageJsonConfigProviderArgs
//   | GcpStorageYamlConfigProviderArgs
//   | GcpSecretEnvConfigProviderArgs
//   | GcpSecretJsonConfigProviderArgs
//   | GcpSecretYamlConfigProviderArgs;

// const configProviderClasses = [
//   EnvConfigProviderArgs,
//   JsonConfigProviderArgs,
//   YamlConfigProviderArgs,
//   GcpStorageEnvConfigProviderArgs,
//   GcpStorageJsonConfigProviderArgs,
//   GcpStorageYamlConfigProviderArgs,
//   GcpSecretEnvConfigProviderArgs,
//   GcpSecretJsonConfigProviderArgs,
//   GcpSecretYamlConfigProviderArgs,
// ] as const;

// // 1. Union of CONSTRUCTOR types (the classes themselves)
// type ConfigProviderConstructors = (typeof configProviderClasses)[number];
// // Result: typeof EnvConfigProviderArgs | typeof JsonConfigProviderArgs | ...

// type TypeOf<C> = C extends { prototype: { type: infer T } } ? T : never;
// type ConstructorByType = {
//   [C in ConfigProviderConstructors as TypeOf<C>]: C;
// };

// // 2. Union of INSTANCE types (what you get after calling new)
// type AllConfigProviderInstances = InstanceType<ConfigProviderConstructors>;

// // 3. Union of the 'type' field values
// type ConfigProviderTypes = AllConfigProviderInstances['type'];

// // 4. constructor type to class mapping
// type ConfigProviderTypeToClassMap = {
//   [K in ConfigProviderTypes]: ProviderTypeToClass<K>;
// };

// // Get constructor by type
// type GetConstructorByType<T extends ConfigProviderTypes> = Extract<
//   ConfigProviderConstructors,
//   { prototype: { type: T } }
// >;

// type ProviderTypeToClass<T extends ConfigProviderType> = Extract<
//   AllConfigProviderArgs,
//   { type: T }
// >;

// // Dynamically generate constructor parameters mapping
// type ConfigProviderArgsMap = {
//   [K in ConfigProviderTypes]: ConstructorParameters<GetConstructorByType<K>>;
// };

// // Dynamically generate the registry at runtime
// const PROVIDER_REGISTRY = configProviderClasses.reduce(
//   (registry, ProviderClass) => {
//     // Create a temporary instance to get the type
//     // This is safe because we're only reading the type property
//     const tempInstance = Object.create(ProviderClass.prototype);
//     const type = tempInstance.type;

//     if (type) {
//       registry[type as ConfigProviderTypes] = ProviderClass;
//     }

//     return registry;
//   },
//   {} as Record<ConfigProviderTypes, ConfigProviderConstructors>,
// );

// // Main factory function using the type field from classes

// export function createConfigProvider<T extends ConfigProviderTypes>(
//   type: T,
//   ...args: ConfigProviderArgsMap[T]
// ): ProviderTypeToClass<T> {
//   const ProviderClass = PROVIDER_REGISTRY[type] as GetConstructorByType<T>;

//   if (!ProviderClass) {
//     throw new Error(`Unknown config provider type: ${type}`);
//   }

//   // @ts-expect-error - TypeScript can't narrow the union type here, but we know it's safe
//   return new ProviderClass(...args) as ProviderTypeToClass<T>;
// }
