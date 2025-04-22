import {Component, inject, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {HotKeysService} from './services/hot-keys.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private readonly hotKeysService = inject(HotKeysService);

  public ngOnInit() {
    this.setHotKeys();
  }

  private setHotKeys(): void {
    window.document.addEventListener('keydown', (event: KeyboardEvent) => {
      this.hotKeysService.hotKeyEvent.next(event.key);
    })
  }
}
