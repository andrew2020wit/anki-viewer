export const appVersion = '1.3.1';

export function getTitleWithVersion(title: string): string {
  return title + ' v' + appVersion;
}
