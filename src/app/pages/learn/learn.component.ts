import {Component, computed, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {finalize, Subscription, take} from 'rxjs';
import {ICardInfo} from '../../interfaces/anki-connect.interface';
import {AnkiConnectService} from '../../services/anki-connect.service';
import {Router, RouterLink} from '@angular/router';
import {ankiCardTypes} from '../../consts/anki-card-types.const';
import {TranscriptionPipe} from '../../pipes/transcription.pipe';
import {HotKeysService} from '../../services/hot-keys.service';
import {EasyFactorEnum} from '../../easy-factor.enum';
import {UrlsEnum} from '../../enums/urls.enum';
import {sortCards} from '../../utils/sort-cards';
import {checkHotKey, HotKeysEnum} from '../../utils/hot-keys';
import {defaultDeckNameConst} from '../../consts/default-deck-name.const';
import {MatTooltipModule} from '@angular/material/tooltip';
import {LocalStorage} from '../../services/local-storage.service';
import {GamepadService} from '../../services/gamepad/gamepad.service';
import {XboxGamepadButtonsEnum} from '../../services/gamepad/xbox-gamepad-buttons.enum';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {AlphabetBarComponent} from './alphabet-bar/alphabet-bar.component';

@UntilDestroy()
@Component({
  selector: 'app-learn',
  imports: [RouterLink, TranscriptionPipe, MatTooltipModule, AlphabetBarComponent],
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
  protected hotKeyIsReadyAfterTimeout = signal(false);

  protected readonly listeningLink = 'http://127.0.0.1:3003/listening';
  protected readonly exampleLink = 'http://127.0.0.1:3003/example';

  private readonly hotKeyTimeoutMs = 1000;

  private readonly gamepadService = inject(GamepadService);

  protected hotKeyIsAllowed = computed(
    () => !this.isLoading() && (this.hotKeyIsReadyAfterTimeout() || this.showBackSide()),
  );

  private readonly timerBaseTimeMs = Date.now();
  private readonly hotKeysService = inject(HotKeysService);
  private readonly localStorageService = inject(LocalStorage);
  private hotKeysServiceSubscription: Subscription | undefined;
  private lastCardId = 0;
  private deckName = this.localStorageService.getItem( this.localStorageService.keys.deckName) || defaultDeckNameConst;
  private hotKeyTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly ankiConnectService: AnkiConnectService,
    private readonly router: Router,
  ) {}

  public ngOnInit() {
    this.getCard();
    this.takeHotKey();
    this.subscribeToGamePad();
  }

  public ngOnDestroy() {
    this.hotKeysServiceSubscription?.unsubscribe();
  }


  private getCard(): void {
    // const ankiRequestText = `deck:${this.deckName} is:due`;
    const ankiRequestText = `deck:${this.deckName} is:new`;

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
        cards.sort(sortCards);

        this.ankiCard.set(cards[0] || null);
        this.cardsNumber.set(cards.length);
        this.learningCardsNumber.set(cards.filter((item) => item.type === 1).length);
        window.scrollTo(0, 0);
        this.setHotKeyTimer();
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
        this.ankiCard.set(card || null);
        this.cardsNumber.set(0);
        this.learningCardsNumber.set(0);
        window.scrollTo(0, 0);
        this.setHotKeyTimer();
      });
  }

  private takeHotKey(): void {
    this.hotKeysServiceSubscription = this.hotKeysService.hotKeyEvent.subscribe((key) => {
      switch (true) {
        case checkHotKey(HotKeysEnum.ShowExtraInfo, key):
          this.showBackSide.set(true);
          break;

        case checkHotKey(HotKeysEnum.LearnAgain, key):
          this.answerCard(EasyFactorEnum.Again);
          break;

        case checkHotKey(HotKeysEnum.SetEasy, key):
          this.answerCard(EasyFactorEnum.Easy);
          break;

        case checkHotKey(HotKeysEnum.RestoreLastCard, key):
          this.restoreLastCard();
          break;

        case checkHotKey(HotKeysEnum.GoToListening, key):
          window.location.href = this.listeningLink;
          break;

        case checkHotKey(HotKeysEnum.GoToExample, key):
          window.location.href = this.exampleLink;
          break;

        case checkHotKey(HotKeysEnum.GoHome, key):
          this.goHome();
          break;
      }
    });
  }

  protected answerCard(easyFactor: EasyFactorEnum): void {
    if (!this.hotKeyIsAllowed()) {
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

  private increaseTimer(): void {
    this.timerCounter.update((value) => value + 1);

    const difference = Math.round((Date.now() - this.timerBaseTimeMs) / 1000);

    const minutes = Math.floor(difference / 60);

    this.timerTimeMin.set(minutes);
  }

  private restoreLastCard(): void {
    if (!this.lastCardId || !this.hotKeyIsAllowed()) {
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

  private goHome(): void {
    this.router.navigate(['/']);
  }

  protected readonly EasyFactorEnum = EasyFactorEnum;

  private setHotKeyTimer(): void {
    if (this.hotKeyTimer) {
      clearTimeout(this.hotKeyTimer);
      this.hotKeyTimer = undefined;
    }

    this.hotKeyIsReadyAfterTimeout.set(false);

    this.hotKeyTimer = setTimeout(() => {
      this.hotKeyIsReadyAfterTimeout.set(true);
    }, this.hotKeyTimeoutMs);
  }

  private subscribeToGamePad(): void {
    this.gamepadService
      .listen$()
      .pipe(untilDestroyed(this))
      .subscribe((x) => {
        switch (true) {
          case x.includes(XboxGamepadButtonsEnum.A):
            this.answerCard( EasyFactorEnum.Again);
            break;
          case x.includes(XboxGamepadButtonsEnum.B):
            this.answerCard( EasyFactorEnum.Easy);
            break;
          case x.includes(XboxGamepadButtonsEnum.Y):
            this.showBackSide.set(true);
            break;
        }
      });
  }
}
