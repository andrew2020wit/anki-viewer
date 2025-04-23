import { ICardInfo } from '../interfaces/anki-connect.interface';

export const sortCards = (a: ICardInfo, b: ICardInfo) => {
  if (a.type !== b.type) {
    return a.type - b.type;
  }

  return a.due - b.due;
};
