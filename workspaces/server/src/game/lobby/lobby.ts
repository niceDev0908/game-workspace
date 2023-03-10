import { Server, Socket } from 'socket.io';

import { AuthenticatedSocket } from '@app/game/types';
import { Instance } from '@app/game/instance/instance';
import { ServerEvents } from '@shared/server/ServerEvents';
import { ServerPayloads } from '@shared/server/ServerPayloads';
import { v4 } from 'uuid';

export class Lobby
{
  public id: string = v4();

  public readonly createdAt: Date = new Date();

  public readonly clients: Map<Socket['id'], AuthenticatedSocket> = new Map<Socket['id'], AuthenticatedSocket>();

  public readonly instance: Instance = new Instance(this);

  constructor(
    private readonly server: Server,
    public readonly maxClients: number,
    public readonly username: string,
  )
  {
    this.id = username;
  }

  public addClient(client: AuthenticatedSocket): void
  {
    this.clients.set(client.id, client);
    client.join(this.id);
    client.data.lobby = this;

    if (this.clients.size >= this.maxClients) {
      this.instance.triggerStart();
    }

    this.dispatchLobbyState();
  }

  public removeClient(client: AuthenticatedSocket): void
  {
    this.clients.delete(client.id);
    client.leave(this.id);
    client.data.lobby = null;

    // If player leave then the game isn't worth to play anymore
    this.instance.triggerFinish();

    // Alert the remaining player that client left lobby
    this.dispatchToLobby<ServerPayloads[ServerEvents.GameMessage]>(ServerEvents.GameMessage, {
      color: 'blue',
      message: 'Opponent left lobby',
    });

    this.dispatchLobbyState();
  }


  public dispatchLobbyState(): void
  {
    const payload: ServerPayloads[ServerEvents.LobbyState] = {
      userList:this.instance.userList,
      identify:this.instance.identify,
      round: this.instance.round,
      socketId:0,
      lobbyId: this.id,
      mode: this.maxClients === 1 ? 'solo' : 'duo',
      delayBetweenRounds: this.instance.delayBetweenRounds,
      hasStarted: this.instance.hasStarted,
      hasFinished: this.instance.hasFinished,
      currentRound: this.instance.currentRound,
      playersCount: this.clients.size,
      cards: this.instance.cards.map(card => card.toDefinition()),
      isSuspended: this.instance.isSuspended,
      scores: this.instance.scores,

      turn: this.instance.turn,
      deck: this.instance.deck,
      hand: this.instance.hand,
      play: this.instance.play,
      hero: this.instance.hero,
    };

    this.dispatchToLobby(ServerEvents.LobbyState, payload);
  }

  public dispatchToLobby<T>(event: ServerEvents, payload: T): void
  {
    this.server.to(this.id).emit(event, payload);
  }
}