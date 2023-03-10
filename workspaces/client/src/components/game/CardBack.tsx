import { Card, CardStateDefinition } from '@memory-cards/shared/common/types';

import { CardsMap } from '@icons/cards/CardsMap';
import Image from 'next/image';

export default function CardBack() {
  let cardBg = 'bg-white/10';

  // if (card.owner) {
  //   cardBg = card.owner === clientId ? 'bg-blue-300/50' : 'bg-red-300/50';
  // }

  return (
    <div
      className={`transition py-3 flex ${cardBg}`}
    >
      <Image
        src={`/assets/images/cardback.png`}
        width={60}
        height={60}
      />
    </div>
  );
}