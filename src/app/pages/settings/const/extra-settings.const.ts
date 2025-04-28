import { StringSettingItem } from '../../../interfaces/string-setting-item.interface';

export const ankiHostSettingItem: StringSettingItem = {
  key: 'ankiHost',
  label: 'ankiHost, def - http://127.0.0.1:8765',
  value: '',
};

export const maxAnkiResultNumberSettingItem: StringSettingItem = {
  key: 'maxAnkiResultNumber',
  label: 'maxAnkiResultNumber (max - 500, def - 50)',
  value: '',
};

export const httpFileServerSettingItem: StringSettingItem = {
  key: 'HttpFileServer',
  label: 'HttpFileServer',
  value: '',
};

export const learningDecksSettingItem: StringSettingItem = {
  key: 'learningDecks',
  label: 'learning decks, like: xxx yyy zzzz',
  value: '',
};

export const extraSettingsConst: StringSettingItem[] = [
  httpFileServerSettingItem,
  learningDecksSettingItem,
  ankiHostSettingItem,
  maxAnkiResultNumberSettingItem,
];
