export type Suit = 'spade' | 'heart' | 'club' | 'diamond';

export interface Poker {
	suit: Suit;
	value: number;
	visible: boolean;
	row: number;
	col: number;
}
