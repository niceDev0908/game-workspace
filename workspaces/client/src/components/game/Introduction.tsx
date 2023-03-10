import { Divider, Input, Select } from '@mantine/core';
import { useEffect, useState } from 'react';

import { ClientEvents } from '@memory-cards/shared/client/ClientEvents';
import { CurrentLobbyState } from '@components/game/states';
import { ListenerList } from '@components/websocket/types';
import { ServerEvents } from '@memory-cards/shared/server/ServerEvents';
import { ServerPayloads } from '@memory-cards/shared/server/ServerPayloads';
import { emitEvent } from '@utils/analytics';
import { showNotification } from '@mantine/notifications';
import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import useSocketManager from '@hooks/useSocketManager';

export default function Introduction() {
  const router = useRouter();
  const {sm} = useSocketManager();
  const currentLobbyState = useRecoilValue(CurrentLobbyState)!;
  const [delayBetweenRounds, setDelayBetweenRounds] = useState<number>(2);
  const [username, setUser] = useState('username');
  const [join_user, setJoin] = useState<string>('join_user');
  const [userList, setUserList] = useState<any[]>([]);

  useEffect(() => {
    if (router.query.lobby) {
      sm.emit({
        event: ClientEvents.LobbyJoin,
        data: {
          lobbyId: router.query.lobby,
        },
      });
    }
  }, [router]);

  useEffect(() => {
    
    const onUserList: ListenerList<ServerPayloads[ServerEvents.UserList]> = (data:any[]) => {
      let list: any[] = [];
      if(data.length) {
        console.log(data);
        data.forEach((item, index) => {
            if(item.size<2)
              list.push({value: item.key, label: item.key});
          })
      }
      setUserList(list);
    }

    sm.emit({
      event: ClientEvents.GetList,
    })
    sm.registerListener(ServerEvents.UserList, onUserList);

    return () => {
      sm.registerListener(ServerEvents.UserList, onUserList);
    };
  }, [])

  // useEffect(() => {
  //   const list:any[] = [];
  //   if(currentLobbyState) {
  //     currentLobbyState.userList.forEach((key, object) => {
  //       list.push(key);
  //     })
  //   }
  //   console.log(currentLobbyState?.userList);
  //   setUserList(list);
  // }, [currentLobbyState])

  const onCreateLobby = (mode: 'solo' | 'duo') => {
      
    
    const list = userList;
    if(list.length > 0) {
      sm.emit({
        event: ClientEvents.LobbyLeave
      });
      sm.emit({
        event: ClientEvents.LobbyJoin,
        data: {
          lobbyId: list[0].value,
        },
      });
      showNotification({
        message: `Connected to ${list[0].value}`,
        color: 'green',
        autoClose: 2000,
      });
    } else {
      sm.emit({
        event: ClientEvents.LobbyCreate,
        data: {
          mode: mode,
          delayBetweenRounds: delayBetweenRounds,
          username: username
        },
      });
    }
    emitEvent('game_create');
  };

  
  const onJoinGame = (mode: 'solo' | 'duo') => {

    const list = userList;
    if(list.length > 0) {
      sm.emit({
        event: ClientEvents.LobbyLeave
      });
      sm.emit({
        event: ClientEvents.LobbyJoin,
        data: {
          lobbyId: list[0].value,
        },
      });
      showNotification({
        message: `Connected to ${list[0].value}`,
        color: 'green',
        autoClose: 2000,
      });
    }
    // sm.emit({
    //   event: ClientEvents.LobbyJoin,
    //   data: {
    //     lobbyId: join_user,
    //   },
    // });

    // emitEvent('lobby_create');
  };

  return (
    <div className="m-8">
      <h2 className="text-2xl">Hello ! 👋</h2>

      <p className="mt-3 text-lg">
        Welcome to a hearthstone multiplayer game.
      </p>

      <Divider my="md"/>

      <div>
        <h3 className="text-xl mb-4">New Game options</h3>

        <Input value={username} onChange={(e)=>{setUser(e.target.value)}}/>
      </div>

      <div className="mt-5 text-center flex justify-between">
        <button className="btn" onClick={() => onCreateLobby('duo')}>Find Game</button>
      </div><Divider my="md"/>

      {/* <div>
        <h3 className="text-xl mb-4">Join Game options</h3>
        
        <Select
          label="Delay between rounds"
          defaultValue="2"
          onChange={(delay) => delay ? setJoin(delay) : setJoin('')}
          data={userList}
        />
      </div> */}

      {/* <div className="mt-5 text-center flex justify-between">
        <button className="btn" onClick={() => onJoinGame('duo')}>Find Game</button>
      </div> */}
    </div>
  );
}