import { ApplicationRef, Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { concat, first, interval } from 'rxjs';
import { InfoService } from './info.service';

@Injectable({
  providedIn: 'root',
})
export class PwaToolService {
  private readonly isTestMode = false;

  constructor(
    private swUpdate: SwUpdate,
    private appRef: ApplicationRef,
    private info: InfoService,
  ) {}

  public init() {
    if (this.isTestMode) {
      console.log('test v 6');
    }

    if (!this.swUpdate.isEnabled) {
      console.warn('!this.swUpdate.isEnabled');

      return;
    }

    this.subscribeToVersionUpdates();
    this.checkForUpdate();
  }

  private subscribeToVersionUpdates() {
    this.swUpdate.versionUpdates.subscribe((evt) => {
      switch (evt.type) {
        case 'VERSION_DETECTED':
          console.log(`new version is detected on the server: ${evt.version.hash}`);
          break;
        case 'VERSION_READY':
          console.log('new version has been downloaded and is ready for activation');
          console.log(`Current app version: ${evt.currentVersion.hash}`);
          console.log(`New app version ready for use: ${evt.latestVersion.hash}`);
          this.info.show('New version is available! Reload page.');
          break;
        case 'VERSION_INSTALLATION_FAILED':
          console.log(`checking for or downloading a new version fails '${evt.version.hash}': ${evt.error}`);
          break;
      }
    });

    this.swUpdate.unrecoverable.subscribe((ev) => {
      const text = 'An error occurred that we cannot recover from:\n' + ev.reason + '\n Please reload the page.';
      this.info.error(text);
      console.error(text);
    });
  }

  private checkForUpdate() {
    const appIsStable$ = this.appRef.isStable.pipe(first((isStable) => isStable === true));

    concat(appIsStable$, interval(this.isTestMode ? 2000 : 3600_000)).subscribe(async () => {
      try {
        const updateFound = await this.swUpdate.checkForUpdate();
        console.log(
          updateFound
            ? 'checkForUpdate: a new version was found and is ready to be activated'
            : 'checkForUpdate: no new version was found. ',
        );
      } catch (err) {
        console.error('checkForUpdate: Failed to check for updates:', err);
      }
    });
  }
}
