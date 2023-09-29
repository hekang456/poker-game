export type Suit = 'spade' | 'heart' | 'club' | 'diamond';

export interface Poker {
	id: number;
	suit: Suit;
	value: number;
	visible: boolean;
	row?: number;
	col?: number;
}
