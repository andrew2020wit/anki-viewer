import { Component, input, OnInit, output, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatInput, MatLabel } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StringSettingItem } from '../../../interfaces/string-setting-item.interface';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-settings-item',
  imports: [
    MatButton,
    MatFormFieldModule,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './settings-item.component.html',
  styleUrl: './settings-item.component.scss',
})
export class SettingsItemComponent implements OnInit {
  public settingItem = input.required<StringSettingItem>();
  public set = output<StringSettingItem>();

  protected value = signal<string>('');

  public ngOnInit() {
    this.value.set(this.settingItem().value);
  }

  protected save(): void {
    const item: StringSettingItem = {
      ...this.settingItem(),
      value: this.value()?.trim() || '',
    };

    this.set.emit(item);
  }
}
