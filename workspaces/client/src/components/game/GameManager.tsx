import { CurrentLobbyState } from '@components/game/states';
import { DndProvider } from 'react-dnd';
import Game from '@components/game/Game';
import { HTML5Backend } from "react-dnd-html5-backend";
import Introduction from '@components/game/Introduction';
import { Listener } from '@components/websocket/types';
import { ServerEvents } from '@memory-cards/shared/server/ServerEvents';
import { ServerPayloads } from '@memory-cards/shared/server/ServerPayloads';
import { TouchBackend } from "react-dnd-touch-backend";
import { isTouchDevice } from "@hooks/utils";
import { showNotification } from '@mantine/notifications';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import useSocketManager from '@hooks/useSocketManager';

const DnDBackend = isTouchDevice() ? TouchBackend : HTML5Backend;

export default function GameManager() {
  const router = useRouter();
  const {sm} = useSocketManager();
  const [lobbyState, setLobbyState] = useRecoilState(CurrentLobbyState);

  useEffect(() => {
    sm.connect();
    const clientId = sm.getSocketId()!;
    console.log(clientId);
    const onLobbyState: Listener<ServerPayloads[ServerEvents.LobbyState]> = async (data) => {
      data.socketId = data.identify[sm.socket.id];
      setLobbyState(data);
      console.log(data);

      router.query.lobby = data.lobbyId;

      await router.push({
        pathname: '/',
        query: {...router.query},
      }, undefined, {});
    };

    const onGameMessage: Listener<ServerPayloads[ServerEvents.GameMessage]> = ({color, message}) => {
      showNotification({
        message: message,
        color: color,
        autoClose: 2000,
      });
    };


    sm.registerListener(ServerEvents.LobbyState, onLobbyState);
    sm.registerListener(ServerEvents.GameMessage, onGameMessage);

    return () => {
      sm.removeListener(ServerEvents.LobbyState, onLobbyState);
      sm.removeListener(ServerEvents.GameMessage, onGameMessage);
    };
  }, []);

  if (lobbyState === null) {
    return <Introduction/>;
  }

  return ( 
    <DndProvider backend={HTML5Backend}>
      <Game/>
    </DndProvider>
  )
}