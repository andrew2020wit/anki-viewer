export enum HotKeysEnum {
  ShowExtraInfo = 'ShowExtraInfo',
  LearnAgain = 'LearnAgain',
  SetHard = 'SetHard',
  SetNormal = 'SetNormal',
  SetEasy = 'SetEasy',
  ReplayAudio = 'ReplayAudio',
  RestoreLastCard = 'RestoreLastCard',
  ForgetCard = 'ForgetCard',
}

export const hotKeys: Record<HotKeysEnum, string[]> = {
  [HotKeysEnum.ShowExtraInfo]: [' '],
  [HotKeysEnum.LearnAgain]: ['1'],
  [HotKeysEnum.SetHard]: ['2'],
  [HotKeysEnum.SetNormal]: ['3', 'enter'],
  [HotKeysEnum.SetEasy]: ['4'],
  [HotKeysEnum.ForgetCard]: ['0'],
  [HotKeysEnum.ReplayAudio]: ['r', 'к'], // Cyrillic: к
  [HotKeysEnum.RestoreLastCard]: ['z', 'я'],
};

export function checkHotKey(action: HotKeysEnum, keyChar: string): boolean {
  return hotKeys[action].includes(keyChar);
}
