export enum ClientEvents
{
  // General
  Ping = 'client.ping',

  // Lobby
  LobbyCreate = 'client.lobby.create',
  LobbyJoin = 'client.lobby.join',
  LobbyLeave = 'client.lobby.leave',
  NextTurn = 'next.turn',

  // Game
  GameRevealCard = 'client.game.reveal_card',
  Summon='client.card.summon',
  Attack='client.attack',
  HeroAttack = 'client.hero.attack',
  GetList='get.list'
}
