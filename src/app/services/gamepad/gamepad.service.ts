import { Injectable } from '@angular/core';
import { distinctUntilChanged, filter, interval, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GamepadService {
  private readonly intervalDelayMs = 50;
  private readonly debounceDelayMs = 300;

  public listen$() {
    return interval(this.intervalDelayMs).pipe(
      map(() => {
        const gamepad = navigator.getGamepads()[0];

        if (!gamepad?.buttons?.length)
          return {
            timestamp: 0,
            buttons: [],
          };

        const timestamp = gamepad.timestamp;

        const buttons = gamepad.buttons
          .map((b, index) => ({ pressed: b.pressed, index }))
          .filter((b) => b.pressed)
          .map((x) => x.index);

        return { buttons, timestamp };
      }),
      filter((x) => !!x.buttons.length),
      distinctUntilChanged((previous, current) => {
        return (
          previous.buttons.join('-') === current.buttons.join('-') &&
          current.timestamp < previous.timestamp + this.debounceDelayMs
        );
      }),
      map((x) => x.buttons),
    );
  }
}
