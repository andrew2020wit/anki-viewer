import {Component, inject} from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {SettingsItemComponent} from './settings-item/settings-item.component';
import {StringSettingItem} from '../../interfaces/string-setting-item.interface';
import {LocalStorage} from '../../services/local-storage.service';

@Component({
  selector: 'app-settings',
  imports: [MatFormFieldModule, MatInputModule, FormsModule, RouterLink, SettingsItemComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private readonly localStorage = inject(LocalStorage);

  protected readonly settings: StringSettingItem[] = [
    {
      key: this.localStorage.keys.deckName,
      label: 'learning deck',
      value: this.localStorage.getItem(this.localStorage.keys.deckName) || '',
    },
    {
      key: this.localStorage.keys.ankiHost,
      label: 'ankiHost, default - http://127.0.0.1:8765',
      value: this.localStorage.getItem(this.localStorage.keys.ankiHost) || '',
    },
  ];

  protected saveSettingItem(item: StringSettingItem): void {
    this.localStorage.setItem(item.key, item.value);
  }
}
