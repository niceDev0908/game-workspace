import { Badge, Center, Container, Grid, LoadingOverlay, Overlay, SimpleGrid, Skeleton, useMantineTheme } from '@mantine/core';

import Card from '@components/game/Card';
import { CardStateDefinition } from '@memory-cards/shared/common/types';
import { CardsMap } from '@icons/cards/CardsMap';
import { ClientEvents } from '@memory-cards/shared/client/ClientEvents';
import { CurrentLobbyState } from '@components/game/states';
import GCard from '@components/game/GCard'
import HeroCard from '@components/game/HeroCard'
import Image from 'next/image';
import { emitEvent } from '@utils/analytics';
import { showNotification } from '@mantine/notifications';
import { useDrop } from 'react-dnd';
import { useRecoilValue } from 'recoil';
import useSocketManager from '@hooks/useSocketManager';

type Props = {
playerId: number;
};

const PRIMARY_COL_HEIGHT = 300;

export default function PlayerSide({playerId}: Props) {
	let cardBg = 'bg-white/10';

	const {sm} = useSocketManager();
	const currentLobbyState = useRecoilValue(CurrentLobbyState)!;
	const [{ isOver, canDrop }, drop] = useDrop(() => ({
		accept: 'card',
		drop:(source:any, monitor) => (
			sm.emit({
			event: ClientEvents.Summon,
			data: source,
			})
		),
		canDrop: (source:any, monitor) => {
			if(source.cost < 0) return false;
			if(currentLobbyState.turn != currentLobbyState.socketId) return false;
			if(currentLobbyState.hero[source.owner].mana >= source.cost) return true;
			return false;
		},
		collect: (monitor) => ({
			isOver: !!monitor.isOver(),
			canDrop: !!monitor.canDrop()
		})
	}),[currentLobbyState])

return (
	<div>
	
		
		<Container my="md">
			<div className="h-14 flex justify-center relative" ref={drop}>
			{/* {isOver && !canDrop && <Overlay color="red" />} */}
			{!isOver && canDrop && <Overlay color="yellow" />}
			{isOver && canDrop && <Overlay color="green" />}

				{currentLobbyState.play.map((card, i) => {
					if(card.owner == playerId)
					return (
						<div
							key={i}
							className="col-span-1"
						>
							<GCard
							payload={card}
							/>
						</div>
						)
					})}
			</div>
		</Container>
		<Container>
	<div className='h-28'>
		<Center>
		<HeroCard 
			payload={currentLobbyState.hero[playerId]}
			/>
		</Center>
	</div>
		</Container>
		<Container my="md">
			<div className="flex h-14 justify-center relative">
				{currentLobbyState.turn!=playerId ? <div className='absolute top-0 left-0 bottom-0 right-0 z-50'></div>:''}

				{currentLobbyState.hand.map((card, i) => {
					if(card.owner == playerId)
					return (
						<div
							key={i}
							className="col-span-1 mx-1 h-100"
						>
							<GCard
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