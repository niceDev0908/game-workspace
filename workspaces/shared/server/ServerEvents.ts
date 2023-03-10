export enum ServerEvents
{
  // General
  Pong = 'server.pong',

  // Lobby
  LobbyState = 'server.lobby.state',

  UserList = 'user.list',

  // Game
  GameMessage = 'server.game.message',
}
