import { Suit } from '../components/type';

export const getAssetsFile = (url: string) => {
	return new URL(`../assets/images/${url}.jpg`, import.meta.url).href;
};

export const getSuit = (suit: Suit) => {
	if (suit === 'spade') {
		return '♠';
	} else if (suit === 'heart') {
		return '♥';
	} else if (suit === 'club') {
		return '♣';
	} else {
		return '♦';
	}
};
