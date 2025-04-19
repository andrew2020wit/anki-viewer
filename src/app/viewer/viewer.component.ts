import {Component, OnInit, signal} from '@angular/core';
import {ICardInfo} from '../interfaces/anki-connect.interface';
import {AnkiConnectService} from '../services/anki-connect.service';
import {InfoService} from '../services/info.service';
import {forkJoin, take} from 'rxjs';
import {ANKI_REQUEST_TEXT_LOCAL_STORAGE_KEY, MAX_ANKI_RESULT_NUMBER,} from '../consts/anki.const';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {EasyFactorEnum} from '../easy-factor.enum';
import {MatCheckbox} from '@angular/material/checkbox';
import {ToolsComponent} from './tools/tools.component';

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

  protected readonly types: Record<number, string> = {
    0: 'new',
    1: 'learning',
    2: 'review',
    3: 'relearning'
  }

  constructor(
    private ankiConnectService: AnkiConnectService,
    private info: InfoService
  ) {
  }

  public ngOnInit() {
    this.getAnkiCards();
  }

  protected selectAll(): void {
    this.ankiCards.set(this.ankiCards().map(item => ({...item, selected: true})));
  }

  protected deselectAll(): void {
    this.ankiCards.set(this.ankiCards().map(item => ({...item, selected: false})));
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
      }
    )
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

    this.ankiConnectService.answerCardsByIds(ids, easyFactor)
      .pipe(take(1))
      .subscribe(() => {
        this.isLoading.set(false);
        this.getAnkiCards();
      });
  }

  protected getAnkiCards(): void {
    const ankiRequestText = this.ankiRequestText();

    if (!ankiRequestText) {
      return;
    }

    localStorage.setItem(
      ANKI_REQUEST_TEXT_LOCAL_STORAGE_KEY,
      ankiRequestText
    );

    this.isLoading.set(true);

    this.ankiConnectService
      .findCards(ankiRequestText)
      .pipe(take(1))
      .subscribe((notes) => {
        const notesToDisplay = notes.slice(0, MAX_ANKI_RESULT_NUMBER);
        // console.log(notesToDisplay);
        this.ankiCards.set(notesToDisplay);
        this.cardsNumber.set(notes.length);
        this.isLoading.set(false);
      });
  }
}
