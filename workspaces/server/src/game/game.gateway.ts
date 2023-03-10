import { LobbyCreateDto, LobbyJoinDto, RevealCardDto } from '@app/game/dtos';
import { Logger, UsePipes } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { AuthenticatedSocket } from '@app/game/types';
import { ClientEvents } from '@shared/client/ClientEvents';
import { LobbyManager } from '@app/game/lobby/lobby.manager';
import { ServerEvents } from '@shared/server/ServerEvents';
import { ServerException } from '@app/game/server.exception';
import { ServerPayloads } from '@shared/server/ServerPayloads';
import { SocketExceptions } from '@shared/server/SocketExceptions';
import { WsValidationPipe } from '@app/websocket/ws.validation-pipe';

@UsePipes(new WsValidationPipe())
@WebSocketGateway()
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger: Logger = new Logger(GameGateway.name);

  constructor(
    private readonly lobbyManager: LobbyManager,
  )
  {
  }

  afterInit(server: Server): any
  {
    // Pass server instance to managers
    this.lobbyManager.server = server;

    this.logger.log('Game server initialized !');
  }

  async handleConnection(client: Socket, ...args: any[]): Promise<void>
  {
    // Call initializers to set up socket
    this.lobbyManager.initializeSocket(client as AuthenticatedSocket);
  }

  async handleDisconnect(client: AuthenticatedSocket): Promise<void>
  {
    // Handle termination of socket
    this.lobbyManager.terminateSocket(client);
  }

  @SubscribeMessage(ClientEvents.Ping)
  onPing(client: AuthenticatedSocket): void
  {
    client.emit(ServerEvents.Pong, {
      message: 'pong',
    });
  }

  @SubscribeMessage(ClientEvents.LobbyCreate)
  onLobbyCreate(client: AuthenticatedSocket, data: LobbyCreateDto): WsResponse<ServerPayloads[ServerEvents.GameMessage]>
  {
    
    const lobby = this.lobbyManager.createLobby(data.mode, data.delayBetweenRounds, data.username);
    lobby.instance.identify[client.id] = 0;
    lobby.addClient(client);

    return {
      event: ServerEvents.GameMessage,
      data: {
        color: 'green',
        message: 'You became a candidate.',
      },
    };
  }

  @SubscribeMessage(ClientEvents.LobbyJoin)
  onLobbyJoin(client: AuthenticatedSocket, data: LobbyJoinDto): void
  {
    this.lobbyManager.joinLobby(data.lobbyId, client);
  }

  @SubscribeMessage(ClientEvents.LobbyLeave)
  onLobbyLeave(client: AuthenticatedSocket): void
  {
    client.data.lobby?.removeClient(client);
  }

  @SubscribeMessage(ClientEvents.GameRevealCard)
  onRevealCard(client: AuthenticatedSocket, data: RevealCardDto): void
  {
    if (!client.data.lobby) {
      throw new ServerException(SocketExceptions.LobbyError, 'You are not in a game');
    }

    client.data.lobby.instance.revealCard(data.cardIndex, client);
  }

  @SubscribeMessage(ClientEvents.Summon)
  onSummon(client: AuthenticatedSocket, data:any): void
  {
    if (!client.data.lobby) {
      throw new ServerException(SocketExceptions.LobbyError, 'You are not in a game');
    }
    client.data.lobby?.instance.summonCard(data, client);
  }
  
  @SubscribeMessage(ClientEvents.NextTurn)
  onNextTurn(client: AuthenticatedSocket): void
  {
    client.data.lobby?.instance.nextTurn(client);
  }
  
  @SubscribeMessage(ClientEvents.Attack)
  onAttack(client: AuthenticatedSocket, data:any): void
  {
    client.data.lobby?.instance.attack(client, data);
  }
  
  @SubscribeMessage(ClientEvents.HeroAttack)
  onHeroAttack(client: AuthenticatedSocket, data:any): void
  {
    client.data.lobby?.instance.heroAttack(client, data);
  }
  
  @SubscribeMessage(ClientEvents.GetList)
  onGetList(client: AuthenticatedSocket): WsResponse<ServerPayloads[ServerEvents.GameMessage]>
  {
    return {
      event: ServerEvents.UserList,
      data: this.lobbyManager.getList()
    };
  }


}