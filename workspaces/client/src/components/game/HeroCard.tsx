import { Card, CardStateDefinition, Hero } from '@memory-cards/shared/common/types';

import { CardsMap } from '@icons/cards/CardsMap';
import Image from 'next/image';

type Props = {
  payload: Hero
};

export default function HeroCard({payload}: Props) {
  let cardBg = 'bg-white/10';

  // if (card.owner) {
  //   cardBg = card.owner === clientId ? 'bg-blue-300/50' : 'bg-red-300/50';
  // }
  return (
    <div
      className={`transition py-3 flex relative justify-center top-1 ${cardBg}`} style={{ height: 120, width:80, }}
    >
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