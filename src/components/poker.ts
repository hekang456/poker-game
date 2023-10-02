// ♠ spade（黑桃，又名葵扇）、♥ heart（红心，又名红桃）、♣ club（梅花，又名草花）、♦ diamond（方块，又名阶砖）
import { shuffle } from 'lodash-es';
import { Suit } from './type';

const suits: Suit[] = ['spade', 'heart', 'club', 'diamond'];
const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

class Pokers {
	pokers: { suit: Suit; value: number }[] = [];
	constructor(public suits: Suit[], public values: number[]) {
		this.generatePokers();
		this.shuffle();
	}

	generatePokers() {
		for (let i = 0; i < this.suits.length; i++) {
			for (let j = 0; j < this.values.length; j++) {
				this.pokers.push({
					suit: this.suits[i],
					value: this.values[j]
				});
			}
		}
	}

	shuffle() {
		this.pokers = shuffle(this.pokers);
		this.pokers = shuffle(this.pokers);
		this.pokers = shuffle(this.pokers);
	}

	reset() {
		this.pokers = [];
		this.generatePokers();
	}
}

const p = new Pokers(suits, values);

export default p;
