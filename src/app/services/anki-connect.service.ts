import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, of, switchMap, take, tap} from 'rxjs';
import {DEFAULT_ANKI_HOST} from '../consts/anki.const';
import {InfoService} from './info.service';
import {ICardInfo, ICardInfoResponse, IFindItemsResponse} from '../interfaces/anki-connect.interface';
import {EasyFactorEnum} from '../easy-factor.enum';

@Injectable({
  providedIn: 'root',
})
export class AnkiConnectService {
  constructor(
    private http: HttpClient,
    private info: InfoService,
  ) {}

  public findCards(request: string): Observable<ICardInfo[]> {
    return this.http
      .post<IFindItemsResponse>(DEFAULT_ANKI_HOST, {
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
            .post<ICardInfoResponse>(DEFAULT_ANKI_HOST, {
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

  public answerCardsByIds(cardIds: number[], ease: EasyFactorEnum ): Observable<boolean> {
    if (!cardIds.length) {
      return of(false).pipe(
        tap(() => {
          const easeKey = ease === EasyFactorEnum.Again ? 'Again' : 'Easy';
          const message = 'AnswerCards(' + cardIds.length + ') : ' + easeKey;
          console.log(message, cardIds);
        }),
      );
    }

    return this.http
      .post<boolean>(DEFAULT_ANKI_HOST, {
        action: 'forgetCards',
        version: 6,
        params: {
          cards: cardIds,
        },
      })
      .pipe(
        catchError((err) => {
          this.info.error('There is error with anki-connection');
          throw err;
        }),
        switchMap(() =>
          this.http.post<boolean>(DEFAULT_ANKI_HOST, {
            action: 'answerCards',
            version: 6,
            params: {
              answers: cardIds.map((id) => ({ cardId: id, ease })), // Ease is between 1 (Again) and 4 (Easy).
            },
          }),
        ),
        tap(() => {
          const easeKey = ease === EasyFactorEnum.Again ? 'Again' : 'Easy';
          const message = 'AnswerCards(' + cardIds.length + ') : ' + easeKey;
          this.info.show( message);
          console.log(message, cardIds);
        }),
      )
  }
}
