import { Component, OnInit, signal } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  computeViewProfileLabelStorageKey,
  computeViewProfileRequestStorageKey,
  VIEW_PROFILE_NUMBER,
} from '../../utils/view-profile';
import { SettingsItemComponent } from './settings-item/settings-item.component';
import { StringSettingItem } from '../../interfaces/string-setting-item.interface';

export const httpFileServerSettingItem: StringSettingItem = {
  key: 'HttpFileServer',
  label: 'HttpFileServer',
  value: '',
};

export const defaultLearningDeckSettingItem: StringSettingItem = {
  key: 'defaultLearningDeck',
  label: 'defaultLearningDeck',
  value: '',
};

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

export const extraSettings: StringSettingItem[] = [
  httpFileServerSettingItem,
  defaultLearningDeckSettingItem,
  ankiHostSettingItem,
  maxAnkiResultNumberSettingItem,
];

@Component({
  selector: 'app-settings',
  imports: [MatFormFieldModule, MatInputModule, FormsModule, RouterLink, SettingsItemComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  protected settingItems = signal<StringSettingItem[]>([]);

  public ngOnInit(): void {
    this.initProfileSettings();
    this.initExtraSettings();
  }

  protected saveSettingItem(item: StringSettingItem): void {
    localStorage.setItem(item.key, item.value);
  }

  private initProfileSettings(): void {
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

    const settings = this.settingItems();
    this.settingItems.set([...settings, ...profileSettings]);
  }

  private initExtraSettings(): void {
    const res: StringSettingItem[] = [];

    extraSettings.forEach((setting) => {
      res.push({
        key: setting.key,
        label: setting.label,
        value: localStorage.getItem(setting.key) || '',
      });
    });

    this.settingItems.set([...this.settingItems(), ...res]);
  }
}
