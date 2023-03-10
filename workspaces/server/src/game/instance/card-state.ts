import { Cards, ICards } from '@shared/common/Cards';

import { CardStateDefinition } from '@shared/common/types';
import { Socket } from 'socket.io';
import { cardArray } from "@shared/common/CardSource";

export class CardState
{
  constructor(
    public readonly card: Cards,
    public isRevealed: boolean = false,
    public isLocked: boolean = false,
    public ownerId: Socket['id'] | null = null,
  )
  {
  }

  public toDefinition(): CardStateDefinition
  {
    return {
      card: this.isRevealed ? this.card : null,
      owner: this.ownerId,
    };
  }
}

export function makeCardSource() {
  var cardSource:any = {}
  cardArray.forEach((card, id) => {
    cardSource[card.id] = card;
  })
  return cardSource;
}

export interface Card {
  id: number,
  cardId: string,
  cardClass: string,
  attack: number,
  cost: number,
  health: number,
  name: string,
  text: string,
  exhausted: boolean,
  type: string,
  owner: number
}
export interface Hero {
  id: number,
  cardId: string,
  cardClass: string,
  attack: number,
  health: number,
  mana: number,
  name: string,
  rarity : string,
  type: string
  owner: number
}

