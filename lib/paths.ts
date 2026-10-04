export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
export function appUrl(path: string) {
  return basePath + path;
}
