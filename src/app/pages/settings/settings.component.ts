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

@Component({
  selector: 'app-settings',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    RouterLink,
    SettingsItemComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  protected settingItems = signal<StringSettingItem[]>([]);

  public ngOnInit(): void {
    this.initProfileSettings();
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

  protected saveSettingItem(item: StringSettingItem): void {
    localStorage.setItem(item.key, item.value);
  }
}
