export const encodeRegExp = (str: string) => str.replace(/[$()*+.?[\\\]^{|}]/g, '\\$&');

export const isRemoteUrl = (url: string) => url.startsWith('http');

export function trimObject(obj: object) {
  for (const key of Object.keys(obj)) {
    if (obj[key] === null || obj[key] === undefined) delete obj[key];
  }
  return obj;
}
