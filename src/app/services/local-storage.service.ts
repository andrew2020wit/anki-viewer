import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorage {
  public readonly keys = {
    ankiHost: 'ankiHost',
    deckName: 'deckName',
  } as const;

  private readonly keyPrefix = 'anki-viewer-';

  public setItem(key: string, value: string): void {
    localStorage.setItem(this.keyPrefix + key, value);
  }

  public getItem(key: string): string {
    return localStorage.getItem(this.keyPrefix + key) || '';
  }
}
