export const appVersion = '3.0.0';

export function getTitleWithVersion(title: string): string {
  return title + ' v' + appVersion;
}
