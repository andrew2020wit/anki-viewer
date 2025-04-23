import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {finalize, Subscription, take} from 'rxjs';
import {ICardInfo} from '../../interfaces/anki-connect.interface';
import {AnkiConnectService} from '../../services/anki-connect.service';
import {InfoService} from '../../services/info.service';
import {RouterLink} from '@angular/router';
import {ankiCardTypes} from '../../consts/anki-card-types.const';
import {TranscriptionPipe} from '../../pipes/transcription.pipe';
import {HotKeysService} from '../../services/hot-keys.service';
import {HotKeys} from '../../enums/hot-keys.enum';
import {EasyFactorEnum} from '../../easy-factor.enum';
import {UrlsEnum} from '../../enums/urls.enum';

@Component({
  selector: 'app-learn',
  imports: [RouterLink, TranscriptionPipe],
  templateUrl: './learn.component.html',
  styleUrl: './learn.component.scss',
})
export class LearnComponent implements OnInit, OnDestroy {
  protected isLoading = signal(false);
  protected ankiCard = signal<ICardInfo | null>(null);
  protected cardsNumber = signal(0);
  protected showBackSide = signal(true);
  protected lastAnswer = signal(0);

  protected readonly UrlsEnum = UrlsEnum;

  protected readonly ankiCardTypes = ankiCardTypes;

  private readonly hotKeysService = inject(HotKeysService);
  private hotKeysServiceSubscription: Subscription | undefined;

  constructor(
    private ankiConnectService: AnkiConnectService,
    private info: InfoService
  ) {
  }

  public ngOnInit() {
    this.getCard();
    this.takeHotKey();
  }

  public ngOnDestroy() {
    this.hotKeysServiceSubscription?.unsubscribe();
  }

  private getCard(): void {
    const ankiRequestText = 'deck:cald is:due';

    this.isLoading.set(true);
    this.showBackSide.set(false);

    this.ankiConnectService
      .findCards(ankiRequestText)
      .pipe(
        take(1),
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe((notes) => {
        notes.sort((a, b) => a.due - b.due);
        // console.log(notes.slice(0, 50));
        this.ankiCard.set(notes[0] || null);
        this.cardsNumber.set(notes.length);
        window.scrollTo(0, 0);
      });
  }

  private takeHotKey(): void {
    this.hotKeysServiceSubscription = this.hotKeysService.hotKeyEvent.subscribe(key => {
      switch (key) {
        case HotKeys.ShowExtraInfo:
          this.showBackSide.set(true);
          break;
        case HotKeys.LearnAgain:
          this.answerCard(EasyFactorEnum.Again);
          break;
        case HotKeys.SetHard:
          this.answerCard(EasyFactorEnum.Hard);
          break;
        case HotKeys.SetNormal:
          this.answerCard(EasyFactorEnum.Normal);
          break;
        case HotKeys.SetEasy:
          this.answerCard(EasyFactorEnum.Easy);
          break;
      }
    })
  }

  private answerCard(easyFactor: EasyFactorEnum): void {
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
        })
      )
      .subscribe(() => {
        this.lastAnswer.set(easyFactor);
        this.getCard();
      });
  }
}
