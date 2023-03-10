import { Card, Hero } from '@app/game/instance/card-state';
import { CardState, makeCardSource } from '@app/game/instance/card-state';
import { Cards, ICards } from '@shared/common/Cards';

import { AuthenticatedSocket } from '@app/game/types';
import { Lobby } from '@app/game/lobby/lobby';
import { SECOND } from '@app/game/constants';
import { ServerEvents } from '@shared/server/ServerEvents';
import { ServerException } from '@app/game/server.exception';
import { ServerPayloads } from '@shared/server/ServerPayloads';
import { Socket } from 'socket.io';
import { SocketExceptions } from '@shared/server/SocketExceptions';

export class Instance
{
    public hasStarted: boolean = false;

    public hasFinished: boolean = false;

    public isSuspended: boolean = false;

    public currentRound: number = 1;

    public cards: CardState[] = [];

    public scores: Record<Socket['id'], number> = {};

    public delayBetweenRounds: number = 2;

    private cardsRevealedForCurrentRound: Record<number, Socket['id']> = {};

    /////////////////////////////////////////////////////////////////////////////////////////
    public userList:any[] = [];

    public round:number = 1;

    public identify: any = {};

    public idList: any = {};

    public deck: Card[] = [];

    public hand: Card[] = [];

    public play: Card[] = [];

    public hero: Hero[] = [];

    public turn: number;



    constructor(
        private readonly lobby: Lobby,
    )
    {
        this.initializeCards();
    }

    public triggerStart(): void
    {
        if (this.hasStarted) {
        return;
        }

        this.hasStarted = true;

        this.lobby.dispatchToLobby<ServerPayloads[ServerEvents.GameMessage]>(ServerEvents.GameMessage, {
        color: 'blue',
        message: 'Game started !',
        });
    }

    public triggerFinish(): void
    {
        if (this.hasFinished || !this.hasStarted) {
        return;
        }

        this.hasFinished = true;

        this.lobby.dispatchToLobby<ServerPayloads[ServerEvents.GameMessage]>(ServerEvents.GameMessage, {
        color: 'blue',
        message: 'Game finished !',
        });
    }

    public summonCard(card: any, client: AuthenticatedSocket): void 
    {
        const payload = card;
        const newCard:Card = {
            id: payload.id,
            cardId: payload.cardId,
            cardClass: payload.cardClass,
            attack: payload.attack? payload.attack: null,
            cost: -1,
            health: payload.health? payload.health : 0,
            name: payload.name,
            text: payload.text,
            exhausted: true,
            type: payload.type,
            owner: payload.owner
        }
        this.hand= this.hand.filter((card, id) => (card.id != payload.id));
        this.hero[payload.owner].mana -= payload.cost;
        if(newCard.type == 'MINION') {
            this.play.push(newCard);
        } else {
            switch (payload.name) {
                case 'Flame Lance':
                    this.play.forEach((card, id) => {
                        if(card.owner == newCard.owner) {
                            card.attack += 1;
                        }
                    })
                    break;
                case 'Effigy':
                    this.hand.forEach((card, id) => {
                        if(card.owner == newCard.owner) {
                            card.cost -= 1;
                        }
                    })
                    break;
                case 'Power Word: Glory':
                    this.hand.forEach((card, id) => {
                        if(card.owner == newCard.owner) {
                            const newMinion = this.makeCard(newCard.cardId, newCard.owner);
                            newMinion.attack = newMinion.health = 2;
                            newMinion.type = 'MINION';
                            newMinion.cost = -1;
                            newMinion.exhausted = true;
                            this.play.push(newMinion);
                        }
                    })
                    break;
                case 'Convert':
                    this.play.forEach((card, id) => {
                        if(card.owner != newCard.owner) {
                            card.health -= 3;
                        }
                    })
                    break;
                case 'Danger':
                    this.hero[payload.owner].health += 1;
                    this.play.forEach((card, id) => {
                        if(card.owner != newCard.owner) {
                            card.health -= 1;
                        }
                    })
                    break;
                case 'Confuse':
                    this.hero[payload.owner].mana += 5;
                    break;
                case 'default':
                    break;
            }
        }
        
        let newPlay:Card[] = [];
        this.play.forEach((card, id) => {
            if(card.health>0) {
                newPlay.push(card);
            }
        })
        this.play = newPlay;
        this.lobby.dispatchLobbyState();
    }

    public nextTurn(client: AuthenticatedSocket): void
    {
        this.hero[this.turn].mana++;
        this.play.forEach((card, id) => {
            card.exhausted = false;
        })
        let newDeck:Card[] = [];
        let flag:boolean = true;
        this.deck.forEach((card, id) => {
            if(card.owner!=this.turn && flag == true) {
                this.hand.push(card);
                flag = false;
            } else {
                newDeck.push(card);
            }
        });
        this.deck = newDeck;
        this.turn = 1 - this.turn;
        this.round++;
        this.lobby.dispatchLobbyState();
    }

    public attack(client: AuthenticatedSocket, data: any):void 
    {
        const source = data.source;
        const payload = data.payload;
        const reduce = Math.min(source.attack, payload.attack);
        let newPlay:Card[] = [];
        this.play.forEach((card, id) => {
            if(card.id==source.id || card.id ==payload.id) {
                card.health -= reduce;
            }
            if(card.health>0) {
                newPlay.push(card);
            }
        })
        this.play = newPlay;
        this.lobby.dispatchLobbyState();
    }

    public heroAttack(client: AuthenticatedSocket, data:any):void 
    {
        if(this.hero[1-this.turn].health <= data.attack) {
            this.hero[1-this.turn].health = 0;
            this.hasFinished = true;
        } else {
            this.hero[1-this.turn].health -= data.attack;
        }
        this.lobby.dispatchLobbyState();
    }

    public revealCard(cardIndex: number, client: AuthenticatedSocket): void
    {
        if (this.isSuspended || this.hasFinished || !this.hasStarted) {
        return;
        }

        // Make sure player didn't play two time already for this round
        let cardAlreadyRevealedCount = 0;

        for (const clientId of Object.values(this.cardsRevealedForCurrentRound)) {
        if (clientId === client.id) {
            cardAlreadyRevealedCount++;
        }
        }

        if (cardAlreadyRevealedCount >= 2) {
        return;
        }

        const cardState = this.cards[cardIndex];

        if (!cardState) {
        throw new ServerException(SocketExceptions.GameError, 'Card index invalid');
        }

        // If card is already revealed then stop now, no need to reveal it again
        if (cardState.isRevealed) {
        return;
        }

        cardState.isRevealed = true;
        cardState.ownerId = client.id;

        // this.cardsRevealedForCurrentRound.push(cardIndex);
        this.cardsRevealedForCurrentRound[cardIndex] = cardState.ownerId;

        client.emit<ServerPayloads[ServerEvents.GameMessage]>(ServerEvents.GameMessage, {
            color: 'blue',
            message: 'You revealed card',
        });

        // If everyone played (revealed 2 cards) then go to next round
        const everyonePlayed = Object.values(this.cardsRevealedForCurrentRound).length === this.lobby.clients.size * 2;

        // If every card have been revealed then go to next round
        let everyCardRevealed = true;

        for (const card of this.cards) {
        if (!card.isRevealed) {
            everyCardRevealed = false;

            break;
        }
        }

        if (everyonePlayed || everyCardRevealed) {
        this.transitionToNextRound();
        }

        this.lobby.dispatchLobbyState();
    }

    private transitionToNextRound(): void
    {
        this.isSuspended = true;

        setTimeout(() => {
        this.isSuspended = false;
        this.currentRound += 1;
        this.cardsRevealedForCurrentRound = {};

        // Loop over each card, and see if they have a pair for the same owner,
        // if so then the card is locked and owner gains a point
        const cardsRevealed = new Map<Cards, CardState>();

        for (const cardState of this.cards) {
            if (cardState.isLocked) {
            continue;
            }

            if (!cardState.isRevealed) {
            continue;
            }

            const previousCard = cardsRevealed.get(cardState.card);

            // We have a pair
            if (previousCard && previousCard.ownerId === cardState.ownerId) {
            cardState.isLocked = true;
            previousCard.isLocked = true;

            // Increment player score
            this.scores[cardState.ownerId!] = (this.scores[cardState.ownerId!] || 0) + 1;
            }

            cardsRevealed.set(cardState.card, cardState);
        }

        // Loop again to hide cards that aren't locked
        // also check if they're not all locked, would mean game is over
        let everyCardLocked = true;

        for (const cardState of this.cards) {
            if (!cardState.isLocked) {
            cardState.isRevealed = false;
            cardState.ownerId = null;
            everyCardLocked = false;
            }
        }

        if (everyCardLocked) {
            this.triggerFinish();
        }

        this.lobby.dispatchLobbyState();
        }, SECOND * this.delayBetweenRounds);
    }

    private initializeCards(): void
    {
        // Get only values, not identifiers
        const cards = Object.values(Cards).filter(c => Number.isInteger(c)) as Cards[];

        // Push two time the card into the list, so it makes a pair
        for (const card of cards) {
        const cardState1 = new CardState(card);
        const cardState2 = new CardState(card);

        this.cards.push(cardState1);
        this.cards.push(cardState2);
        }

        // Shuffle array randomly
        this.cards = this.cards.sort((a, b) => 0.5 - Math.random());

        //////////////////////////////////////////////////////////////
        this.turn = 0;

        this.hero.push(this.makeHero('HERO_01', 0));
        this.hero.push(this.makeHero('HERO_02', 0));

        this.deck.push(this.makeCard('CS2_125', 0));
        this.deck.push(this.makeCard('CS2_182', 0));
        this.deck.push(this.makeCard('CS2_121', 1));
        this.deck.push(this.makeCard('CS2_188', 1));

        this.deck.push(this.makeCard('AT_013', 1));
        this.deck.push(this.makeCard('AT_015', 0));
        this.deck.push(this.makeCard('AT_001', 1));
        this.deck.push(this.makeCard('AT_002', 0));
        this.deck.push(this.makeCard('AT_016', 1));
        this.deck.push(this.makeCard('AT_016', 0));

        this.hand.push(this.makeCard('AT_005t', 0));
        this.hand.push(this.makeCard('CS2_141', 0));
        this.hand.push(this.makeCard('CS2_187', 0));
        this.hand.push(this.makeCard('AT_001', 0));
        
        this.hand.push(this.makeCard('AT_002', 1));
        this.hand.push(this.makeCard('AT_003', 1));
        this.hand.push(this.makeCard('AT_004', 1));
    }
    private makeCard(id: string, owner: number):Card {
        let key = 0;
        while(1) {
        key = Math.floor(Math.random() * 1000000);
        if(!this.idList[key]) break;
        }
        this.idList[key] = true;
        const cardSource = makeCardSource();
        const card = cardSource[id];
        const newCard:Card = {
        id: key,
        cardId: card.id,
        cardClass: card.cardClass,
        attack: card.attack? card.attack: null,
        cost: card.cost,
        health: card.health? card.health : 0,
        name: card.name,
        text: card.text,
        exhausted: false,
        type: card.type,
        owner: owner
        }
        return newCard;
    } 
    private makeHero(id: string, owner: number):Hero {
        let key = 0;
        while(1) {
        key = Math.floor(Math.random() * 1000000);
        if(!this.idList[key]) break;
        }
        this.idList[key] = true;
        const cardSource = makeCardSource();
        const card = cardSource[id];
        const newHero:Hero = {
        id: key,
        cardId: card.id,
        cardClass: card.cardClass,
        attack: card.attack? card.attack: null,
        // health: card.health,
        health: 10,
        name: card.name,
        mana: 1,
        rarity: card.rarity,
        type: card.type,
        owner: owner
        }
        return newHero;
    }
}