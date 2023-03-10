import { Badge, Center, Container, Grid, LoadingOverlay, Overlay, SimpleGrid, Skeleton, useMantineTheme } from '@mantine/core';

import Card from '@components/game/Card';
import CardBack from '@components/game/CardBack'
import { CardStateDefinition } from '@memory-cards/shared/common/types';
import { CardsMap } from '@icons/cards/CardsMap';
import { ClientEvents } from '@memory-cards/shared/client/ClientEvents';
import { CurrentLobbyState } from '@components/game/states';
import GCard from '@components/game/GCard'
import GOCard from '@components/game/GOCard'
import HeroOCard from '@components/game/HeroOCard'
import Image from 'next/image';
import { emitEvent } from '@utils/analytics';
import { showNotification } from '@mantine/notifications';
import {useEffect} from 'react'
import { useRecoilValue } from 'recoil';
import useSocketManager from '@hooks/useSocketManager';

type Props = {
  playerId: number;
};

const PRIMARY_COL_HEIGHT = 300;

export default function OpponentSide({playerId}: Props) {
  let cardBg = 'bg-white/10';


  const {sm} = useSocketManager();
  const currentLobbyState = useRecoilValue(CurrentLobbyState)!;
  const clientId = sm.getSocketId()!;
  

useEffect(() => {
	
}, [])
  return (
    <div className='relative'>
      
		{/* <div className='absolute top-0 left-0 bottom-0 right-0 z-40'></div> */}
		<Container my="md">
			<div className="flex h-14 justify-center relative">

				{currentLobbyState.hand.map((card, i) => {
					if(card.owner == playerId)
					return (
						<div
							key={i}
							className="col-span-1 mx-1 h-100"
						>
							<CardBack
							/>
						</div>
						)
					})}
			</div>
		</Container>
		<Container>
      <div className='h-28'>
        <Center>
          <HeroOCard 
            payload={currentLobbyState.hero[playerId]}
            />
        </Center>
      </div>
		</Container>
		
		<Container my="md">
			<div className="h-14 flex justify-center">

				{currentLobbyState.play.map((card, i) => {
					if(card.owner == playerId)
					return (
						<div
							key={i}
							className="col-span-1"
						>
							<GOCard
							payload={card}
							/>
						</div>
						)
					})}
			</div>
		</Container>
    </div>
  );
}