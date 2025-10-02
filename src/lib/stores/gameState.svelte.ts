import { items } from '$lib/data/items';
import type { Item, GeneratedItem } from '$lib/types/item';

interface GameState {
	itemsAvailable: Item[];
	itemsUsed: GeneratedItem[];
}

function createGameState() {
	let state = $state<GameState>({
		itemsAvailable: [...items],
		itemsUsed: []
	});

	return {
		get itemsAvailable() {
			return state.itemsAvailable;
		},
		get itemsUsed() {
			return state.itemsUsed;
		},
		markItemUsed(item: GeneratedItem) {
			// Remove from available
			const index = state.itemsAvailable.findIndex((i) => i.type === item.type);
			if (index !== -1) {
				state.itemsAvailable = [
					...state.itemsAvailable.slice(0, index),
					...state.itemsAvailable.slice(index + 1)
				];
			}
			// Add to used
			state.itemsUsed = [...state.itemsUsed, item];
		},
		reset() {
			state.itemsAvailable = [...items];
			state.itemsUsed = [];
		}
	};
}

export const gameState = createGameState();
