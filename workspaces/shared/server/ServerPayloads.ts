import { Card, CardStateDefinition, Hero } from '../common/types';

import { ServerEvents } from './ServerEvents';

export type ServerPayloads = {
  [ServerEvents.LobbyState]: {
    userList: any[];
    socketId:number;
    round:number;
    identify:any;
    lobbyId: string;
    mode: 'solo' | 'duo';
    delayBetweenRounds: number;
    hasStarted: boolean;
    hasFinished: boolean;
    currentRound: number;
    playersCount: number;
    cards: CardStateDefinition[];
    isSuspended: boolean;
    scores: Record<string, number>;

    //////////////////////////////////////////////////////

    turn: number;
    deck: Card[];
    hand: Card[];
    play: Card[];
    hero: Hero[];
  };

  [ServerEvents.GameMessage]: {
    message: string;
    color?: 'green' | 'red' | 'blue' | 'orange';
  };

  [ServerEvents.UserList]: {
    data: any;
  }
};