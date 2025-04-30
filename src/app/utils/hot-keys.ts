export enum HotKeysEnum {
  ForgetCard = 'ForgetCard',
  GoHome = 'GoHome',
  LearnAgain = 'LearnAgain',
  PlayAudio = 'PlayAudio',
  RestoreLastCard = 'RestoreLastCard',
  // SetEasy = 'SetEasy',
  SetHard = 'SetHard',
  SetNormal = 'SetNormal',
  ShowExtraInfo = 'ShowExtraInfo',
}

export const hotKeys: Record<HotKeysEnum, string[]> = {
  [HotKeysEnum.ForgetCard]: ['0'],
  [HotKeysEnum.GoHome]: ['home', 'h', 'р'], // Cyrillic: р
  [HotKeysEnum.LearnAgain]: ['1'],
  [HotKeysEnum.PlayAudio]: ['r', 'к'], // Cyrillic: к
  [HotKeysEnum.RestoreLastCard]: ['z', 'я'],
  // [HotKeysEnum.SetEasy]: [],
  [HotKeysEnum.SetHard]: ['2'],
  [HotKeysEnum.SetNormal]: ['3', 'enter'],
  [HotKeysEnum.ShowExtraInfo]: [' '],
};

export function checkHotKey(action: HotKeysEnum, keyChar: string): boolean {
  return hotKeys[action].includes(keyChar);
}
