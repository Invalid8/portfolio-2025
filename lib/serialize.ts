/* eslint-disable @typescript-eslint/no-explicit-any */

// export function serializeFirestoreData(data: any): any {
//   if (Array.isArray(data)) return data.map(serializeFirestoreData);
//   if (data && typeof data === "object") {
//     const serialized: Record<string, any> = {};
//     for (const key in data) {
//       const value = data[key];
//       if (value instanceof Date) serialized[key] = value.toISOString();
//       else serialized[key] = serializeFirestoreData(value);
//     }
//     return serialized;
//   }
//   return data;
// }

export function serializeFirestoreData(data: any): any {
  if (Array.isArray(data)) {
    return data.map(serializeFirestoreData);
  } else if (data && typeof data === "object") {
    if ("_seconds" in data && "_nanoseconds" in data) {
      return new Date(
        data._seconds * 1000 + data._nanoseconds / 1e6,
      ).toISOString();
    }
    const serialized: Record<string, any> = {};
    for (const key in data) {
      serialized[key] = serializeFirestoreData(data[key]);
    }
    return serialized;
  } else {
    return data;
  }
}
