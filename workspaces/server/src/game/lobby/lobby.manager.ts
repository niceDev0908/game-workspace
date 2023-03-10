import { AuthenticatedSocket } from '@app/game/types';
import { Cron } from '@nestjs/schedule';
import { LOBBY_MAX_LIFETIME } from '@app/game/constants';
import { Lobby } from '@app/game/lobby/lobby';
import { LobbyMode } from '@app/game/lobby/types';
import { Server } from 'socket.io';
import { ServerEvents } from '@shared/server/ServerEvents';
import { ServerException } from '@app/game/server.exception';
import { ServerPayloads } from '@shared/server/ServerPayloads';
import { SocketExceptions } from '@shared/server/SocketExceptions';

export class LobbyManager
{
  public server: Server;

  private readonly lobbies: Map<Lobby['id'], Lobby> = new Map<Lobby['id'], Lobby>();

  public initializeSocket(client: AuthenticatedSocket): void
  {
    client.data.lobby = null;
  }

  public terminateSocket(client: AuthenticatedSocket): void
  {
    client.data.lobby?.removeClient(client);
  }

  public getList(): any 
  {
    let userList:any = [];
    this.lobbies.forEach((Object, key)=> {
      const size = this.lobbies.get(key)?.clients.size;
      if(size && size < 2) {
        userList.push({key, size});
      } 
      
    })
    return userList;
  }
  public createLobby(mode: LobbyMode, delayBetweenRounds: number, username: string): Lobby
  {
    let maxClients = 2;

    switch (mode) {
      case 'solo':
        maxClients = 1;
        break;

      case 'duo':
        maxClients = 2;
        break;
    }


    const lobby = new Lobby(this.server, maxClients, username);

    lobby.instance.delayBetweenRounds = delayBetweenRounds;

    this.lobbies.set(lobby.id, lobby);;

    return lobby;
  }

  public joinLobby(lobbyId: string, client: AuthenticatedSocket): void
  {
    const lobby = this.lobbies.get(lobbyId);

    if (!lobby) {
      throw new ServerException(SocketExceptions.LobbyError, 'Lobby not found');
    }

    if (lobby.clients.size >= lobby.maxClients) {
      throw new ServerException(SocketExceptions.LobbyError, 'Lobby already full');
    }
    lobby.instance.identify[client.id] = 1;
    lobby.addClient(client);
  }

}