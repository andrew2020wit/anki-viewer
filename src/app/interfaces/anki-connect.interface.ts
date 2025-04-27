import { ICardFields } from './card-fields.interface';

export interface IFindItemsResponse {
  error: any;
  result: number[];
}

export interface ICardInfoResponse {
  error: any;
  result: ICardInfo[];
}

export interface ICardInfo {
  cardId: number;
  deckName: string;
  due: number;
  fields: ICardFields;
  interval: number; // -- interval (used in SRS algorithm). Negative = seconds, positive = days
  mod: number;
  nextReviews: [string, string, string, string];
  selected?: boolean;
  type: number; // 0=new, 1=learning, 2=review, 3=relearning
}
