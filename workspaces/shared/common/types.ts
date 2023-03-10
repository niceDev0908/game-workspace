import { Cards } from './Cards';

export type CardStateDefinition = {
  card: Cards | null;
  owner: string | null;
};


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

