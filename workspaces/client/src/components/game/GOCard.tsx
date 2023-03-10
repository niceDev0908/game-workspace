import { Card, CardStateDefinition } from '@memory-cards/shared/common/types';
import { useDrag, useDrop } from "react-dnd"

import { CardsMap } from '@icons/cards/CardsMap';
import { ClientEvents } from '@memory-cards/shared/client/ClientEvents';
import { CurrentLobbyState } from './states';
import Image from 'next/image';
import { Overlay } from '@mantine/core';
import { useRecoilValue } from 'recoil';
import useSocketManager from '@hooks/useSocketManager';

type Props = {
  payload: Card
};

export default function GCard({payload}: Props) {
	const {sm} = useSocketManager();
  const currentLobbyState = useRecoilValue(CurrentLobbyState)!;
  // if (card.owner) {
  //   cardBg = card.owner === clientId ? 'bg-blue-300/50' : 'bg-red-300/50';
  // }

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
		accept: 'card',
		drop:(source:any, monitor) => (
			sm.emit({
			event: ClientEvents.Attack,
			data: {source, payload},
			})
		),
		canDrop: (source:any, monitor) => {
      return source.cost < 0;
		},
		collect: (monitor) => ({
			isOver: !!monitor.isOver(),
			canDrop: !!monitor.canDrop()
		})
	}),[currentLobbyState])

  
  return (
    <div className='relative group flex flex-col overflow-visible' style={{ height: 80, width:60, }}>
        {currentLobbyState.hero[payload.owner].mana < payload.cost && <div className='absolute right-0 top-0 bottom-0 left-0 z-30 bg-red-600 opacity-0'/>}
        {payload.exhausted==true?<div className='absolute top-0 right-0 left-0 bottom-0 z-30 bg-yellow-600 opacity-0'></div>:''}
      
      <div
        className={`transition relative py-3 flex justify-center`} ref={drop}  style={{ height: 80, width:60, }}
      >
        {payload.cost >= 0 ? <div className='absolute top-0 left-0 rounded-full z-30 bg-white w-5 h-5 flex items-center justify-center text-yellow-600'>{payload.cost}</div>:''}
        {payload.type=='MINION'?<div className='absolute bottom-0 left-0 rounded-full z-30 bg-white w-5 h-5 flex items-center justify-center text-red-600'>{payload.attack}</div>:''}
        {payload.type=='MINION'?<div className='absolute bottom-0 right-0 rounded-full z-30 bg-white w-5 h-5 flex items-center justify-center text-green-600'>{payload.health}</div>:''}
        {payload.exhausted==true?<div className='absolute top-0 right-0 rounded-full z-30 bg-white w-5 h-5 flex items-center justify-center text-black'>z</div>:''}
        {currentLobbyState.hero[payload.owner].mana < payload.cost && <div className='absolute right-0 top-0 bottom-0 left-0 z-30 bg-red-600 opacity-50'/>}
        {payload.exhausted==true?<div className='absolute top-0 right-0 left-0 bottom-0 z-30 bg-yellow-600 opacity-40'></div>:''}
        {isOver && canDrop && <div className='absolute bottom-0 right-0 top-0 left-0 z-30 bg-red-600 flex items-center justify-center opacity-40'></div>}
        <div className='absolute top-1.5'>
          <Image
            src={`/assets/images/${payload.cardId}.webp`}
            width={payload.type=='hero' ? 100 : 40}
            height={payload.type=='hero' ? 100 : 40}
            className={`
              transition
              hover:scale-[1.2]
              ${null === null ? 'cursor-pointer' : ''}
            `}
          />
        </div>
        <div className='absolute top-0 left-0 right-0 bottom-0' style={{ height: 100, width:60, }}>
        <Image
          src={`/assets/images/template.png`}
          width={60}
          height={80}
        />
        </div>
      </div>
      </div>
  );
}