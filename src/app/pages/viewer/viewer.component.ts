import { Component, OnInit, signal } from '@angular/core';
import { finalize, forkJoin, take } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCheckbox } from '@angular/material/checkbox';
import { ToolsComponent } from './tools/tools.component';
import { ANKI_REQUEST_TEXT_LOCAL_STORAGE_KEY, MAX_ANKI_RESULT_NUMBER } from '../../consts/anki.const';
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
export class ViewerComponent implements OnInit {
  protected ankiRequestText = signal<string>(localStorage.getItem(ANKI_REQUEST_TEXT_LOCAL_STORAGE_KEY) || 'flag:2');
  protected ankiCards = signal<ICardInfo[]>([]);
  protected cardsNumber = signal(0);
  protected readonly MAX_ANKI_RESULT_NUMBER = MAX_ANKI_RESULT_NUMBER;
  protected compactMode = signal(true);
  protected isLoading = signal(false);
  protected selectedCardNumber = signal(0);
  protected profileIndex = signal(0);
  protected readonly UrlsEnum = UrlsEnum;
  protected readonly ankiCardTypes = ankiCardTypes;
  protected profiles = signal<ViewProfile[]>([]);
  protected timerTimeMin = signal(0);

  private readonly timerBaseTimeMs = Date.now();

  constructor(
    private ankiConnectService: AnkiConnectService,
    private info: InfoService,
  ) {}

  public ngOnInit() {
    this.initProfiles();
    this.getAnkiCards();
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
        const notesToDisplay = notes.slice(0, MAX_ANKI_RESULT_NUMBER);
        console.log(notesToDisplay);
        this.increaseTimer();
        this.ankiCards.set(notesToDisplay);
        this.cardsNumber.set(notes.length);
        window.scrollTo(0, 0);
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
}
