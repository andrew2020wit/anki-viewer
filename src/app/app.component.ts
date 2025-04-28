import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HotKeysService } from './services/hot-keys.service';
import { PwaToolService } from './services/pwa-tool.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private readonly hotKeysService = inject(HotKeysService);
  private readonly pwaToolService = inject(PwaToolService);

  public ngOnInit() {
    this.pwaToolService.init();
    this.setHotKeys();
  }

  private setHotKeys(): void {
    window.document.addEventListener('keydown', (event: KeyboardEvent) => {
      // console.log(event);
      this.hotKeysService.hotKeyEvent.next(event.key.toLowerCase());
    });
  }
}
