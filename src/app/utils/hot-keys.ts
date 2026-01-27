export enum HotKeysEnum {
  ForgetCard = 'ForgetCard',
  GoHome = 'GoHome',
  LearnAgain = 'LearnAgain',
  RestoreLastCard = 'RestoreLastCard',
  SetEasy = 'SetEasy',
  ShowExtraInfo = 'ShowExtraInfo',
}

export const hotKeys: Record<HotKeysEnum, string[]> = {
  [HotKeysEnum.ForgetCard]: ['0'],
  [HotKeysEnum.GoHome]: ['home', 'h', 'р'], // Cyrillic: р
  [HotKeysEnum.LearnAgain]: ['1'],
  [HotKeysEnum.RestoreLastCard]: ['z', 'я'],
  [HotKeysEnum.SetEasy]: ['3'],
  [HotKeysEnum.ShowExtraInfo]: [' '],
};

export function checkHotKey(action: HotKeysEnum, keyChar: string): boolean {
  return hotKeys[action].includes(keyChar);
}
