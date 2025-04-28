import { Component, OnInit, signal } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SettingsItemComponent } from './settings-item/settings-item.component';
import { StringSettingItem } from '../../interfaces/string-setting-item.interface';
import { extraSettingsConst } from './const/extra-settings.const';
import { getProfileStringSettingItems } from './util/get-profile-string-setting-items';

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
    const profileSettings = getProfileStringSettingItems();
    const settings = this.settingItems();

    this.settingItems.set([...settings, ...profileSettings]);
  }

  private initExtraSettings(): void {
    const res: StringSettingItem[] = [];

    extraSettingsConst.forEach((setting) => {
      res.push({
        key: setting.key,
        label: setting.label,
        value: localStorage.getItem(setting.key) || '',
      });
    });

    this.settingItems.set([...this.settingItems(), ...res]);
  }
}
