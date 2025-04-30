import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { finalize, Subscription, take } from 'rxjs';
import { ICardInfo } from '../../interfaces/anki-connect.interface';
import { AnkiConnectService } from '../../services/anki-connect.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ankiCardTypes } from '../../consts/anki-card-types.const';
import { TranscriptionPipe } from '../../pipes/transcription.pipe';
import { HotKeysService } from '../../services/hot-keys.service';
import { EasyFactorEnum } from '../../easy-factor.enum';
import { UrlQueriesEnum, UrlsEnum } from '../../enums/urls.enum';
import { sortCards } from '../../utils/sort-cards';
import { checkHotKey, HotKeysEnum } from '../../utils/hot-keys';
import { defaultDeckNameConst } from '../../consts/default-deck-name.const';
import { extractSoundUrl } from '../../utils/extract-sound-url';
import { httpFileServerSettingItem, learningDecksSettingItem } from '../settings/const/extra-settings.const';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-learn',
  imports: [RouterLink, TranscriptionPipe, MatTooltipModule],
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
  protected timerCounter = signal(0);
  protected timerTimeMin = signal(0);
  protected readonly UrlsEnum = UrlsEnum;
  protected readonly ankiCardTypes = ankiCardTypes;

  private readonly timerBaseTimeMs = Date.now();
  private readonly hotKeysService = inject(HotKeysService);
  private hotKeysServiceSubscription: Subscription | undefined;
  private htmLAudioElement: HTMLAudioElement | null = null;
  private lastCardId = 0;
  private deckName = defaultDeckNameConst;

  constructor(
    private readonly ankiConnectService: AnkiConnectService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
  ) {}

  public ngOnInit() {
    this.checkDeckName();
    this.getCard();
    this.takeHotKey();
  }

  public ngOnDestroy() {
    this.hotKeysServiceSubscription?.unsubscribe();
    this.htmLAudioElement?.pause();
    this.htmLAudioElement?.remove();
  }

  protected replayAudio(): void {
    if (this.htmLAudioElement) {
      this.htmLAudioElement.currentTime = 0;
    }

    this.htmLAudioElement?.play();
  }

  private getCard(): void {
    const ankiRequestText = `deck:${this.deckName} is:due`;

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
        // console.log(cards.slice(0, 50));
        this.stopAudio();

        cards.sort(sortCards);

        this.ankiCard.set(cards[0] || null);
        this.cardsNumber.set(cards.length);
        this.learningCardsNumber.set(cards.filter((item) => item.type === 1).length);
        window.scrollTo(0, 0);
        this.initAudio();
      });
  }

  private getCardById(id: number): void {
    if (!id) {
      return;
    }

    this.isLoading.set(true);
    this.showBackSide.set(false);

    this.ankiConnectService
      .getCardById(id)
      .pipe(
        take(1),
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe((card) => {
        this.stopAudio();
        this.ankiCard.set(card || null);
        this.cardsNumber.set(0);
        this.learningCardsNumber.set(0);
        window.scrollTo(0, 0);
        this.initAudio();
      });
  }

  private takeHotKey(): void {
    this.hotKeysServiceSubscription = this.hotKeysService.hotKeyEvent.subscribe((key) => {
      switch (true) {
        case checkHotKey(HotKeysEnum.ShowExtraInfo, key):
          this.showBackSide.set(true);
          this.replayAudio();
          break;
        case checkHotKey(HotKeysEnum.LearnAgain, key):
          this.answerCard(EasyFactorEnum.Again);
          break;
        case checkHotKey(HotKeysEnum.SetHard, key):
          this.answerCard(EasyFactorEnum.Hard);
          break;
        case checkHotKey(HotKeysEnum.SetNormal, key):
          this.answerCard(EasyFactorEnum.Normal);
          break;
        // case checkHotKey(HotKeysEnum.SetEasy, key):
        //   this.answerCard(EasyFactorEnum.Easy);
        //   break;
        case checkHotKey(HotKeysEnum.PlayAudio, key):
          this.replayAudio();
          break;

        case checkHotKey(HotKeysEnum.RestoreLastCard, key):
          this.restoreLastCard();
          break;

        case checkHotKey(HotKeysEnum.ForgetCard, key):
          this.forgetCard();
          break;

        case checkHotKey(HotKeysEnum.GoHome, key):
          this.goHome();
          break;
      }
    });
  }

  private forgetCard(): void {
    if (!this.showBackSide()) {
      return;
    }

    this.isLoading.set(true);

    const cardId = this.ankiCard()?.cardId;

    if (!cardId) {
      return;
    }

    this.ankiConnectService
      .forgetCard(cardId)
      .pipe(
        take(1),
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe(() => {
        this.lastAnswer.set(0);
        this.increaseTimer();
        this.getCard();
      });
  }

  protected answerCard(easyFactor: EasyFactorEnum): void {
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
        this.lastCardId = cardId;
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

    const soundUrl = extractSoundUrl(soundUrlStr);

    const baseUrl = localStorage.getItem(httpFileServerSettingItem.key);

    if (!soundUrl || !baseUrl) {
      return;
    }

    this.htmLAudioElement = new Audio(baseUrl + soundUrl);

    this.htmLAudioElement.play();
  }

  private stopAudio(): void {
    this.htmLAudioElement?.pause();
  }

  private increaseTimer(): void {
    this.timerCounter.update((value) => value + 1);

    const difference = Math.round((Date.now() - this.timerBaseTimeMs) / 1000);

    const minutes = Math.floor(difference / 60);

    this.timerTimeMin.set(minutes);
  }

  private restoreLastCard(): void {
    if (!this.lastCardId) {
      return;
    }

    this.ankiConnectService
      .answerCardsByIds([this.lastCardId], EasyFactorEnum.Again)
      .pipe(
        take(1),
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe(() => {
        this.getCardById(this.lastCardId);
      });
  }

  private checkDeckName(): void {
    const urlDeckName = this.activatedRoute.snapshot.queryParams[UrlQueriesEnum.Deck];
    const localStorageDeckName = localStorage.getItem(learningDecksSettingItem.key)?.split(' ')?.[0];
    const deckName = urlDeckName || localStorageDeckName || defaultDeckNameConst;

    if (!urlDeckName) {
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParamsHandling: 'merge',
        queryParams: {
          [UrlQueriesEnum.Deck]: deckName,
        },
      });
    }

    this.deckName = deckName;
  }

  private goHome(): void {
    this.router.navigate(['/']);
  }

  protected readonly EasyFactorEnum = EasyFactorEnum;
}
