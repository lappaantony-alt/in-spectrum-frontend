type AnyObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is AnyObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function convertKeys(obj: unknown, converter: (key: string) => string): unknown {
  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeys(item, converter));
  }

  if (isPlainObject(obj)) {
    const result: AnyObject = {};
    for (const [key, value] of Object.entries(obj)) {
      result[converter(key)] = convertKeys(value, converter);
    }
    return result;
  }

  return obj;
}

export function toSnakeCaseKeys<T = unknown>(obj: unknown): T {
  return convertKeys(obj, toSnakeCase) as T;
}

export function toCamelCaseKeys<T = unknown>(obj: unknown): T {
  return convertKeys(obj, toCamelCase) as T;
}
