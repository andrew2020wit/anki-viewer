export const appVersion = '1.2.1';

export function getTitleWithVersion(title: string): string {
  return title + ' v' + appVersion;
}
