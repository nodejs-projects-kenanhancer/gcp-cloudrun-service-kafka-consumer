import { Injectable } from '@nestjs/common';
import { EnvConfigProcessor } from '../interfaces';

@Injectable()
export class DefaultEnvConfigProcessor extends EnvConfigProcessor {
  process<TResult = Record<string, any>>(
    envConfig: Record<string, string>,
  ): TResult {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(envConfig)) {
      this.setNestedProperty(result, key, this.parseValue(value));
    }

    return result as TResult;
  }

  private parseValue(value: string): any {
    // Try parsing as number
    if (!isNaN(Number(value)) && value.trim() !== '') {
      return Number(value);
    }

    // Parse boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;

    // Handle null
    if (value.toLowerCase() === 'null') return null;

    // Handle arrays (comma-separated)
    if (value.includes(',')) {
      return value.split(',').map((item) => this.parseValue(item.trim()));
    }

    // Default to string
    return value;
  }

  private setNestedProperty(
    obj: Record<string, any>,
    path: string,
    value: any,
  ): void {
    const keys = path.split('__');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = this.camelCase(keys[i].toLowerCase());
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }

    const lastKey = this.camelCase(keys[keys.length - 1].toLowerCase());
    current[lastKey] = value;
  }

  private camelCase(str: string): string {
    return str
      .toLowerCase()
      .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }
}
