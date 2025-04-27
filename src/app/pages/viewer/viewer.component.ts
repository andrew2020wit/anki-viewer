import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { finalize, forkJoin, Subscription, take } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCheckbox } from '@angular/material/checkbox';
import { ToolsComponent } from './tools/tools.component';
import { ANKI_REQUEST_TEXT_LOCAL_STORAGE_KEY, DEFAULT_MAX_ANKI_RESULT_NUMBER } from '../../consts/anki.const';
import { EasyFactorEnum } from '../../easy-factor.enum';
import { ICardInfo } from '../../interfaces/anki-connect.interface';
import { AnkiConnectService } from '../../services/anki-connect.service';
import { InfoService } from '../../services/info.service';
import { RouterLink } from '@angular/router';
import { ankiCardTypes } from '../../consts/anki-card-types.const';
import { TranscriptionPipe } from '../../pipes/transcription.pipe';
import { UrlsEnum } from '../../enums/urls.enum';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { getProfilesSettings, ViewProfile } from '../../utils/view-profile';
import { httpFileServerSettingItem, maxAnkiResultNumberSettingItem } from '../settings/settings.component';
import { extractSoundUrl } from '../../utils/extract-sound-url';
import { sortCards } from '../../utils/sort-cards';
import { checkHotKey, HotKeysEnum } from '../../utils/hot-keys';
import { HotKeysService } from '../../services/hot-keys.service';

interface AudioItem {
  url: string;
  listIndex: number;
}

@Component({
  selector: 'app-viewer',
  imports: [
    FormsModule,
    MatButton,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCheckbox,
    ToolsComponent,
    RouterLink,
    TranscriptionPipe,
    MatButtonToggleModule,
  ],
  templateUrl: './viewer.component.html',
  styleUrl: './viewer.component.scss',
})
export class ViewerComponent implements OnInit, OnDestroy {
  protected ankiRequestText = signal<string>(localStorage.getItem(ANKI_REQUEST_TEXT_LOCAL_STORAGE_KEY) || 'flag:2');
  protected ankiCards = signal<ICardInfo[]>([]);
  protected cardsNumber = signal(0);

  protected readonly MAX_ANKI_RESULT_NUMBER: number = DEFAULT_MAX_ANKI_RESULT_NUMBER;

  protected compactMode = signal(true);
  protected isLoading = signal(false);
  protected selectedCardNumber = signal(0);
  protected profileIndex = signal(0);
  protected readonly UrlsEnum = UrlsEnum;
  protected readonly ankiCardTypes = ankiCardTypes;
  protected profiles = signal<ViewProfile[]>([]);
  protected timerTimeMin = signal(0);
  protected autoPlayIsOn = signal(false);
  protected indexOfPlayingItem = signal(-1);
  protected readonly resultItemIdPrefix = 'app-viewer-result-item-';

  private readonly timerBaseTimeMs = Date.now();

  private audioList: AudioItem[] = [];
  private currentAudioIndex = 0;
  private htmLAudioElement: HTMLAudioElement | null = null;
  private readonly baseAudioUrl = localStorage.getItem(httpFileServerSettingItem.key);
  private readonly audioListDelayMs = 1000;
  private readonly hotKeysService = inject(HotKeysService);
  private hotKeysServiceSubscription: Subscription | undefined;

  constructor(
    private ankiConnectService: AnkiConnectService,
    private info: InfoService,
  ) {
    const maxNumber = +(localStorage.getItem(maxAnkiResultNumberSettingItem.key) || 0);
    if (Number.isInteger(maxNumber) && maxNumber < 500 && maxNumber > 0) {
      this.MAX_ANKI_RESULT_NUMBER = maxNumber;
    }
  }

  public ngOnInit() {
    this.takeHotKey();
    this.initProfiles();
    this.getAnkiCards();
  }

  public ngOnDestroy() {
    this.hotKeysServiceSubscription?.unsubscribe();
    this.stopAudioPlay();
  }

  protected switchAutoPlay(): void {
    this.autoPlayIsOn.update((value) => !value);

    if (this.autoPlayIsOn()) {
      this.playCurrentAudioItem();
    } else {
      this.stopAudioPlay();
    }
  }

  private computeAutoPlaylist(): void {
    this.audioList = this.ankiCards()
      .map((item, index) => {
        return {
          url: extractSoundUrl(item.fields?.sound?.value),
          listIndex: index,
        };
      })
      .filter((item) => !!item.url);

    this.currentAudioIndex = 0;
  }

  private playCurrentAudioItem(): void {
    if (!this.baseAudioUrl || !this.audioList.length || !this.autoPlayIsOn()) {
      return;
    }

    if (this.currentAudioIndex > this.audioList.length - 1) {
      this.currentAudioIndex = 0;
    }

    this.htmLAudioElement = new Audio(this.baseAudioUrl + this.audioList[this.currentAudioIndex].url);

    this.htmLAudioElement.play();

    document
      .getElementById(this.resultItemIdPrefix + this.audioList[this.currentAudioIndex].listIndex)
      ?.scrollIntoView({ behavior: 'smooth' });

    this.indexOfPlayingItem.set(this.audioList[this.currentAudioIndex].listIndex);

    this.htmLAudioElement.addEventListener('ended', () => {
      this.currentAudioIndex++;

      setTimeout(() => {
        this.playCurrentAudioItem();
      }, this.audioListDelayMs);
    });
  }

  private stopAudioPlay(): void {
    this.htmLAudioElement?.pause();
    this.htmLAudioElement?.remove();
    this.indexOfPlayingItem.set(-1);
  }

  protected setProfile(profile: ViewProfile | null): void {
    if (!profile) {
      return;
    }

    if (profile.request === this.ankiRequestText()) {
      return;
    }

    this.ankiRequestText.set(profile.request);

    this.getAnkiCards();
  }

  protected selectAll(): void {
    this.ankiCards.set(this.ankiCards().map((item) => ({ ...item, selected: true })));

    this.selectedCardNumber.set(this.ankiCards().length);
  }

  protected deselectAll(): void {
    this.ankiCards.set(this.ankiCards().map((item) => ({ ...item, selected: false })));

    this.selectedCardNumber.set(0);
  }

  protected mixedAnswer(): void {
    if (!this.ankiCards().length) {
      return;
    }

    const againIds = this.ankiCards()
      .filter((item) => item.selected)
      .map((item) => item.cardId);

    const easyIds = this.ankiCards()
      .filter((item) => !item.selected)
      .map((item) => item.cardId);

    const againObs$ = this.ankiConnectService.answerCardsByIds(againIds, EasyFactorEnum.Again);
    const easyObs$ = this.ankiConnectService.answerCardsByIds(easyIds, EasyFactorEnum.Easy);

    this.isLoading.set(true);

    forkJoin([againObs$, easyObs$]).subscribe(() => {
      this.isLoading.set(false);
      this.getAnkiCards();
    });
  }

  protected answerCards(easyFactor: EasyFactorEnum): void {
    const ids = this.ankiCards()
      .filter((item) => item.selected)
      .map((item) => item.cardId);

    if (!ids.length) {
      this.info.error('Nothing to add!');

      return;
    }

    this.isLoading.set(true);

    this.ankiConnectService
      .answerCardsByIds(ids, easyFactor)
      .pipe(
        take(1),
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe(() => {
        this.getAnkiCards();
      });
  }

  protected getAnkiCards(): void {
    const ankiRequestText = this.ankiRequestText();

    if (!ankiRequestText) {
      return;
    }

    localStorage.setItem(ANKI_REQUEST_TEXT_LOCAL_STORAGE_KEY, ankiRequestText);

    this.isLoading.set(true);
    this.selectedCardNumber.set(0);

    this.ankiConnectService
      .findCards(ankiRequestText)
      .pipe(
        take(1),
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe((notes) => {
        if (ankiRequestText.includes('is:due')) {
          notes.sort(sortCards);
        }

        const notesToDisplay = notes.slice(0, this.MAX_ANKI_RESULT_NUMBER);
        // console.log(notesToDisplay);
        this.increaseTimer();
        this.ankiCards.set(notesToDisplay);
        this.cardsNumber.set(notes.length);
        window.scrollTo(0, 0);

        this.computeAutoPlaylist();

        if (this.autoPlayIsOn()) {
          this.playCurrentAudioItem();
        }
      });
  }

  protected computeSelectedCardNumber(): void {
    let cardNumber = 0;

    this.ankiCards().forEach((card) => {
      if (card.selected) {
        cardNumber++;
      }
    });

    this.selectedCardNumber.set(cardNumber);
  }

  private initProfiles(): void {
    this.profiles.set(getProfilesSettings());
    let currentIndex = 0;

    this.profiles().forEach((profile) => {
      if (profile.request === this.ankiRequestText()) {
        currentIndex = profile.index;
      }
    });

    this.profileIndex.set(currentIndex);
  }

  private increaseTimer(): void {
    const difference = Math.round((Date.now() - this.timerBaseTimeMs) / 1000);

    const minutes = Math.floor(difference / 60);

    this.timerTimeMin.set(minutes);
  }

  private takeHotKey(): void {
    this.hotKeysServiceSubscription = this.hotKeysService.hotKeyEvent.subscribe((key) => {
      switch (true) {
        case checkHotKey(HotKeysEnum.ReplayAudio, key):
          this.switchAutoPlay();
          break;
      }
    });
  }
}
