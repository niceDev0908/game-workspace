import GameManager from '@components/game/GameManager';
import Header from '@components/layout/Header';
import type { NextPage } from 'next';

const Page: NextPage = () => {
  return (
    <div className="container max-w-4xl h-screen mt-0 ">
      {/* <Header/> */}
      <GameManager/>
    </div>
  );
};

export default Page;
