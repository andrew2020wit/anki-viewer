import { StringSettingItem } from '../../../interfaces/string-setting-item.interface';
import {
  computeViewProfileLabelStorageKey,
  computeViewProfileRequestStorageKey,
  VIEW_PROFILE_NUMBER,
} from '../../../utils/view-profile';

export function getProfileStringSettingItems(): StringSettingItem[] {
  const profileSettings: StringSettingItem[] = [];

  for (let i = 1; i <= VIEW_PROFILE_NUMBER; i++) {
    const labelKey = computeViewProfileLabelStorageKey(i);

    profileSettings.push({
      key: labelKey,
      label: labelKey,
      value: localStorage.getItem(labelKey) || '',
    });

    const requestKey = computeViewProfileRequestStorageKey(i);

    profileSettings.push({
      key: requestKey,
      label: requestKey,
      value: localStorage.getItem(requestKey) || '',
    });
  }

  return profileSettings;
}
