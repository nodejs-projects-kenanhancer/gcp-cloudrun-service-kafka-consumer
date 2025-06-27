import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import type { PackageJson } from 'type-fest';
import {
  ConfigProviderArgs,
  EnvConfigProviderArgs,
  GcpStorageEnvConfigProviderArgs,
  ProjectMetadataError,
} from './infrastructure';

// discriminated union type
type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

function getProjectInfo(): Result<{ name: string; version: string }> {
  try {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    const packageJson: PackageJson = JSON.parse(
      fs.readFileSync(packageJsonPath, 'utf8'),
    ) as PackageJson;
    const { name = '', version = '' } = packageJson;

    if (!name) {
      return {
        success: false,
        error: new ProjectMetadataError(
          'Project name is missing in package.json',
        ),
      };
    }
    if (!version) {
      return {
        success: false,
        error: new ProjectMetadataError(
          'Project version is missing in package.json',
        ),
      };
    }

    return {
      success: true,
      value: { name, version },
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: new ProjectMetadataError('package.json contains invalid JSON'),
      };
    }
    return {
      success: false,
      error:
        error instanceof ProjectMetadataError
          ? error
          : new ProjectMetadataError(
              `Failed to load project information: ${String(error)}`,
            ),
    };
  }
}

export function createAppConfig(): ConfigProviderArgs {
  if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
  }

  // Validate environment variables
  const requiredVars = [
    'BASIC_SETTINGS__APP_CONFIG_BUCKET',
    'BASIC_SETTINGS__GCP_PROJECT_ID',
    'BASIC_SETTINGS__ENVIRONMENT',
    'BASIC_SETTINGS__GCP_SERVICE_NAME',
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`,
    );
  }

  const projectInfo = getProjectInfo();
  if (!projectInfo.success) {
    throw projectInfo.error;
  }

  const { name: projectName } = projectInfo.value;

  const {
    BASIC_SETTINGS__APP_CONFIG_BUCKET: appConfigBucket,
    BASIC_SETTINGS__GCP_PROJECT_ID: projectId,
    BASIC_SETTINGS__ENVIRONMENT: environment,
    BASIC_SETTINGS__GCP_SERVICE_NAME: serviceName,
  } = process.env as Record<string, string>; // Type assertion after validation

  return new GcpStorageEnvConfigProviderArgs(
    appConfigBucket,
    `.env.${projectName}.${serviceName}.${environment}`,
    projectId,
  );
}

export function createAppConfigLocal(): ConfigProviderArgs {
  return new EnvConfigProviderArgs(`.env`);
}
