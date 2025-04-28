import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { InfoService } from './info.service';
import { ICardInfo, ICardInfoResponse, IFindItemsResponse } from '../interfaces/anki-connect.interface';
import { EasyFactorEnum } from '../easy-factor.enum';
import { DEFAULT_ANKI_HOST } from '../consts/anki.const';
import { ankiHostSettingItem } from '../pages/settings/const/extra-settings.const';

@Injectable({
  providedIn: 'root',
})
export class AnkiConnectService {
  private readonly ankiHost = localStorage.getItem(ankiHostSettingItem.key) || DEFAULT_ANKI_HOST;

  constructor(
    private http: HttpClient,
    private info: InfoService,
  ) {}

  public getCardById(id: number): Observable<ICardInfo> {
    return this.http
      .post<ICardInfoResponse>(this.ankiHost, {
        action: 'cardsInfo',
        version: 6,
        params: {
          cards: [id],
        },
      })
      .pipe(
        tap((x) => {
          if (x?.error) {
            this.info.error('Anki findCards error');
          }
        }),
        map((x) => x.result?.[0]),
      );
  }

  public findCards(request: string): Observable<ICardInfo[]> {
    return this.http
      .post<IFindItemsResponse>(this.ankiHost, {
        action: 'findCards',
        version: 6,
        params: {
          query: request,
        },
      })
      .pipe(
        catchError((err) => {
          this.info.error('There is error with anki-connection');
          throw err;
        }),
        tap((x) => {
          if (x?.error) {
            this.info.error('Anki findCards error');
          }
        }),
        switchMap((idsObject) => {
          return this.http
            .post<ICardInfoResponse>(this.ankiHost, {
              action: 'cardsInfo',
              version: 6,
              params: {
                cards: idsObject.result,
              },
            })
            .pipe(
              tap((x) => {
                if (x?.error) {
                  this.info.error('Anki findCards error');
                }
              }),
              map((x) => x.result),
            );
        }),
      );
  }

  public forgetCard(cardId: number): Observable<boolean> {
    if (!cardId) {
      return of(false);
    }

    return this.http
      .post<boolean>(this.ankiHost, {
        action: 'forgetCards',
        version: 6,
        params: {
          cards: [cardId],
        },
      })
      .pipe(
        catchError((err) => {
          this.info.error('There is error with anki-connection');
          throw err;
        }),
      );
  }

  public answerCardsByIds(cardIds: number[], ease: EasyFactorEnum): Observable<boolean> {
    if (!cardIds.length) {
      return of(false);
    }

    return this.http
      .post<boolean>(this.ankiHost, {
        action: 'answerCards',
        version: 6,
        params: {
          answers: cardIds.map((id) => ({ cardId: id, ease })), // Ease is between 1 (Again) and 4 (Easy).
        },
      })
      .pipe(
        catchError((err) => {
          this.info.error('There is error with anki-connection');
          throw err;
        }),
      );
  }
}
