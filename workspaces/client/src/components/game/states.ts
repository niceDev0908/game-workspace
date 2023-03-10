import { ServerEvents } from '@memory-cards/shared/server/ServerEvents';
import { ServerPayloads } from '@memory-cards/shared/server/ServerPayloads';
import { atom } from 'recoil';

export const CurrentLobbyState = atom<ServerPayloads[ServerEvents.LobbyState] | null>({
  key: 'CurrentLobbyState',
  default: null,
});