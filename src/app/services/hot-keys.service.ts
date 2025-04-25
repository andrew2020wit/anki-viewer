import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HotKeysService {
  public hotKeyEvent = new Subject<string>();
}
