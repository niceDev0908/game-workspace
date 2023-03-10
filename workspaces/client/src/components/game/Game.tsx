import { Badge, Button, Center, Container, Grid, LoadingOverlay, Overlay, SimpleGrid, Skeleton, useMantineTheme } from '@mantine/core';

import Card from '@components/game/Card';
import CardBack from './CardBack';
import { ClientEvents } from '@memory-cards/shared/client/ClientEvents';
import { CurrentLobbyState } from '@components/game/states';
import { MantineColor } from '@mantine/styles';
import OpponentSide from '@components/game/OpponentSide';
import PlayerSide from '@components/game/PlayerSide';
import { emitEvent } from '@utils/analytics';
import { showNotification } from '@mantine/notifications';
import { useRecoilValue } from 'recoil';
import useSocketManager from '@hooks/useSocketManager';

const PRIMARY_COL_HEIGHT = 300;

export default function Game() {
const theme = useMantineTheme();
// const SECONDARY_COL_HEIGHT = `calc(${PRIMARY_COL_HEIGHT} / 2 - ${theme.spacing.md} / 2)`;
const SECONDARY_COL_HEIGHT = "100%";


const {sm} = useSocketManager();
const currentLobbyState = useRecoilValue(CurrentLobbyState)!;
const clientId = sm.getSocketId()!;
let clientScore = 0;
let opponentScore = 0;

for (const scoreId in currentLobbyState.scores) {
	if (scoreId === clientId) {
	clientScore = currentLobbyState.scores[scoreId];
	} else {
	opponentScore = currentLobbyState.scores[scoreId];
	}
}

// Compute result
let result: string;
let resultColor: MantineColor;

if (clientScore === opponentScore) {
	result = 'Draw, no one won!';
	resultColor = 'yellow';
} else if (clientScore > opponentScore) {
	result = 'You won!';
	resultColor = 'blue';
} else {
	result = 'You lost...';
	resultColor = 'red';
}

const nextTurn = () => {
	sm.emit({
		event: ClientEvents.NextTurn,
	});
}

return (
	<div className="bg-[url('/assets/images/board.png')] bg-center bg-contain bg-no-repeat">
	{currentLobbyState.hasFinished &&<div className='absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center'>
		{currentLobbyState.hero[currentLobbyState.socketId].health > 0 ? <div className='bg-white relative z-50 text-red-600 text-2xl bg-green-400 p-4 cursor-pointer' onClick={()=>{window.location.href='/'}}>You Won!</div> : <div className='bg-white relative z-50 text-black	 text-2xl bg-yellow-400 p-4 cursor-pointer' onClick={()=>{window.location.href='/'}}>You Lost!</div>}
	</div>}
	{!currentLobbyState.hasStarted && <div className='absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-black z-40'>
		<div className='bg-white relative z-50 text-red-600 text-2xl p-4 cursor-pointer'>Waiting for Opponent...</div>
	</div>}
	{currentLobbyState.hasFinished && <Overlay opacity={0.6} color="#000" blur={2} zIndex={40}/>}
	
	{/* <LoadingOverlay visible={!currentLobbyState.hasStarted || currentLobbyState.isSuspended}/> */}
		
		<Grid>
			<Grid.Col span={2}></Grid.Col>
			<Grid.Col span={8}>
				<OpponentSide playerId={1-currentLobbyState.socketId} />
				<div className='h-40'></div>
				<PlayerSide playerId={currentLobbyState.socketId} />
				</Grid.Col>
					<Grid.Col span={2} className='flex flex-col justify-center items-center'>
						{currentLobbyState.deck.filter((card)=>(card.owner==0)) .length}
						<CardBack></CardBack>
						{currentLobbyState.socketId!=currentLobbyState.turn? <button className="bg-blue-500 text-black font-bold py-2 px-2 rounded" disabled>Opponent Turn</button>
						 :<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded w-100" onClick={()=>nextTurn()}>Next Turn</button>}
						
						<CardBack></CardBack>
						{currentLobbyState.deck.filter((card)=>(card.owner==1)).length}
					</Grid.Col>
				</Grid>
	</div>
);
}