import { Card, CardStateDefinition, Hero } from '@memory-cards/shared/common/types';
import { useDrag, useDrop } from "react-dnd"

import { CardsMap } from '@icons/cards/CardsMap';
import { ClientEvents } from '@memory-cards/shared/client/ClientEvents';
import { CurrentLobbyState } from './states';
import Image from 'next/image';
import { useRecoilValue } from 'recoil';
import useSocketManager from '@hooks/useSocketManager';

type Props = {
  payload: Hero
};

export default function HeroOCard({payload}: Props) {
  let cardBg = 'bg-white/10';
	const {sm} = useSocketManager();
  const currentLobbyState = useRecoilValue(CurrentLobbyState)!;


  const [{ isOver, canDrop }, drop] = useDrop(() => ({
		accept: 'card',
		drop:(source:any, monitor) => (
			sm.emit({
			event: ClientEvents.HeroAttack,
			data: source,
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
  // if (card.owner) {
  //   cardBg = card.owner === clientId ? 'bg-blue-300/50' : 'bg-red-300/50';
  // }
  return (
    <div
      className={`transition py-3 flex relative justify-center ${cardBg}`} ref={drop} style={{ height: 120, width:80, }}
    >
      {isOver && canDrop && <div className='absolute bottom-0 right-0 top-0 left-0 z-30 bg-red-600 flex items-center justify-center opacity-40'></div>}
      <div className='absolute bottom-0 left-0 rounded-full z-30 bg-white w-6 h-6 flex items-center justify-center text-yellow-600'>{payload.mana}</div>
      <div className='absolute bottom-0 right-0 rounded-full z-30 bg-white w-6 h-6 flex items-center justify-center text-green-600'>{payload.health}</div>
      <div className='absolute top-1.5'>
      <Image
        src={`/assets/images/${payload.cardId}.webp`}
        width={60}
        height={60}
        className={`
          transition
          z-20
          hover:scale-[1.2]
          ${null === null ? 'cursor-pointer' : ''}
        `}
      />
      </div>
      <div className='absolute top-0 left-0 right-0 bottom-0 z-20' style={{ height: 120, width:80, }}>
      <Image
        src={`/assets/images/hero.png`}
        width={100}
        height={140}
      />
      </div>
    </div>
  );
}