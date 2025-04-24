export enum HotKeysExtionsEnum {
  ShowExtraInfo = 'ShowExtraInfo',
  LearnAgain = 'LearnAgain',
  SetHard = 'SetHard',
  SetNormal = 'SetNormal',
  SetEasy = 'SetEasy',
  ReplayAudio = 'ReplayAudio',
  RestoreLastCard = 'RestoreLastCard',
}

export const hotKeys: Record<HotKeysExtionsEnum, string[]> = {
  [HotKeysExtionsEnum.ShowExtraInfo]: [' '],
  [HotKeysExtionsEnum.LearnAgain]: ['1'],
  [HotKeysExtionsEnum.SetHard]: ['2'],
  [HotKeysExtionsEnum.SetNormal]: ['3', 'enter'],
  [HotKeysExtionsEnum.SetEasy]: ['4'],
  [HotKeysExtionsEnum.ReplayAudio]: ['r', 'к'], // Cyrillic: к
  [HotKeysExtionsEnum.RestoreLastCard]: ['z', 'я']
};

export function chekcHotKey(
  action: HotKeysExtionsEnum,
  keyChar: string,
): boolean {
  return hotKeys[action].includes(keyChar);
}
