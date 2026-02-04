/* eslint-disable @typescript-eslint/no-explicit-any */
export function serializeFirestoreData(data: any): any {
  if (Array.isArray(data)) return data.map(serializeFirestoreData);
  if (data && typeof data === "object") {
    const serialized: Record<string, any> = {};
    for (const key in data) {
      const value = data[key];
      if (value instanceof Date) serialized[key] = value.toISOString();
      else serialized[key] = serializeFirestoreData(value);
    }
    return serialized;
  }
  return data;
}
