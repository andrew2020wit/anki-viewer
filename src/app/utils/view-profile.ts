export const VIEW_PROFILE_NUMBER = 4;

export interface ViewProfile {
  label: string;
  request: string;
  index: number;
}

export function computeViewProfileLabelStorageKey(index: number): string {
  return 'ViewProfileLabel-' + index;
}

export function computeViewProfileRequestStorageKey(index: number): string {
  return 'ViewProfileRequest-' + index;
}

export function getProfilesSettings(): ViewProfile[] {
  const settingItems: ViewProfile[] = [];

  for (let i = 1; i <= VIEW_PROFILE_NUMBER; i++) {
    settingItems.push({
      index: i,
      label: localStorage.getItem(computeViewProfileLabelStorageKey(i)) || '',
      request: localStorage.getItem(computeViewProfileRequestStorageKey(i)) || '',
    });
  }

  return settingItems.filter((item) => item.request && item.label);
}
