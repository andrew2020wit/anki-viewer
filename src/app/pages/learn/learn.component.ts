import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { finalize, Subscription, take } from 'rxjs';
import { ICardInfo } from '../../interfaces/anki-connect.interface';
import { AnkiConnectService } from '../../services/anki-connect.service';
import { RouterLink } from '@angular/router';
import { ankiCardTypes } from '../../consts/anki-card-types.const';
import { TranscriptionPipe } from '../../pipes/transcription.pipe';
import { HotKeysService } from '../../services/hot-keys.service';
import { EasyFactorEnum } from '../../easy-factor.enum';
import { UrlsEnum } from '../../enums/urls.enum';
import {
  defaultLearningDeckSettingItem,
  httpFileServerSettingItem,
} from '../settings/settings.component';
import { sortCards } from '../../utils/sort-cards';
import { chekcHotKey, HotKeysExtionsEnum } from '../../utils/hot-keys';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-learn',
  imports: [RouterLink, TranscriptionPipe, DatePipe],
  templateUrl: './learn.component.html',
  styleUrl: './learn.component.scss',
})
export class LearnComponent implements OnInit, OnDestroy {
  protected isLoading = signal(false);
  protected ankiCard = signal<ICardInfo | null>(null);

  protected cardsNumber = signal(0);
  protected learningCardsNumber = signal(0);

  protected showBackSide = signal(true);
  protected lastAnswer = signal(0);

  protected timerIsOn = signal(false);
  protected timerCounter = signal(0);
  protected timerTimeMin = signal(0);
  private timerBaseTimeMs = 0;

  protected readonly UrlsEnum = UrlsEnum;

  protected readonly ankiCardTypes = ankiCardTypes;

  private readonly hotKeysService = inject(HotKeysService);
  private hotKeysServiceSubscription: Subscription | undefined;

  private htmLAudioElement: HTMLAudioElement | null = null;

  constructor(private ankiConnectService: AnkiConnectService) {}

  public ngOnInit() {
    this.getCard();
    this.takeHotKey();
    this.switchTimer(true);
  }

  public ngOnDestroy() {
    this.hotKeysServiceSubscription?.unsubscribe();
  }

  private getCard(): void {
    const defaultLearningDeck =
      localStorage.getItem(defaultLearningDeckSettingItem.key) || 'cald';

    const ankiRequestText = `deck:${defaultLearningDeck} is:due`;

    this.isLoading.set(true);
    this.showBackSide.set(false);

    this.ankiConnectService
      .findCards(ankiRequestText)
      .pipe(
        take(1),
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe((cards) => {
        console.log(cards.slice(0, 50));
        this.stopAudio();

        cards.sort(sortCards);

        this.ankiCard.set(cards[0] || null);
        this.cardsNumber.set(cards.length);
        this.learningCardsNumber.set(
          cards.filter((item) => item.type === 1).length,
        );
        window.scrollTo(0, 0);
        this.initAudio();
      });
  }

  private takeHotKey(): void {
    this.hotKeysServiceSubscription = this.hotKeysService.hotKeyEvent.subscribe(
      (key) => {
        switch (true) {
          case chekcHotKey(HotKeysExtionsEnum.ShowExtraInfo, key):
            this.showBackSide.set(true);
            this.replayAudio();
            break;
          case chekcHotKey(HotKeysExtionsEnum.LearnAgain, key):
            this.answerCard(EasyFactorEnum.Again);
            break;
          case chekcHotKey(HotKeysExtionsEnum.SetHard, key):
            this.answerCard(EasyFactorEnum.Hard);
            break;
          case chekcHotKey(HotKeysExtionsEnum.SetNormal, key):
            this.answerCard(EasyFactorEnum.Normal);
            break;
          case chekcHotKey(HotKeysExtionsEnum.SetEasy, key):
            this.answerCard(EasyFactorEnum.Easy);
            break;
          case chekcHotKey(HotKeysExtionsEnum.ReplayAudio, key):
            this.replayAudio();
            break;

          case chekcHotKey(HotKeysExtionsEnum.StartTimer, key):
            this.switchTimer(true);
            break;
          case chekcHotKey(HotKeysExtionsEnum.StopTimer, key):
            this.switchTimer(false);
            break;
        }
      },
    );
  }

  private answerCard(easyFactor: EasyFactorEnum): void {
    if (!this.showBackSide()) {
      return;
    }

    this.isLoading.set(true);

    const cardId = this.ankiCard()?.cardId;

    if (!cardId) {
      return;
    }

    this.ankiConnectService
      .answerCardsByIds([cardId], easyFactor)
      .pipe(
        take(1),
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe(() => {
        this.increaseTimer();
        this.lastAnswer.set(easyFactor);
        this.getCard();
      });
  }

  private initAudio(): void {
    const soundUrlStr = this.ankiCard()?.fields?.sound?.value;

    this.htmLAudioElement = null;

    if (!soundUrlStr) {
      return;
    }

    const soundUrl = soundUrlStr
      .replaceAll('[sound:', '')
      .replaceAll(']', '')
      .trim();

    const baseUrl = localStorage.getItem(httpFileServerSettingItem.key);

    if (!soundUrl || !baseUrl) {
      return;
    }

    this.htmLAudioElement = new Audio(baseUrl + soundUrl);

    this.htmLAudioElement.play();
  }

  protected replayAudio(): void {
    this.htmLAudioElement?.play();
  }

  private stopAudio(): void {
    this.htmLAudioElement?.pause();
  }

  private switchTimer(value: boolean): void {
    this.timerIsOn.set(value);

    this.timerCounter.set(0);
    this.timerTimeMin.set(0);

    if (value) {
      this.timerBaseTimeMs = Date.now();
    } else {
      this.timerBaseTimeMs = 0;
    }
  }

  private increaseTimer(): void {
    if (!this.timerIsOn()) {
      return;
    }

    this.timerCounter.update((value) => value + 1);

    const difference = Math.round((Date.now() - this.timerBaseTimeMs)/1000);

    const minutes = Math.floor(difference / 60);

    this.timerTimeMin.set(minutes);
  }
}
