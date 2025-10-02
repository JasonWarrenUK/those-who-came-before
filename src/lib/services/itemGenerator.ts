import { indexRandom } from '$lib/utils/indexRandom';
import { materials } from '$lib/data/materials';
import { gameState } from '$lib/stores/gameState.svelte';
import type { Item, GeneratedItem } from '$lib/types/item';

/**
 * Applies a random material trait to an item
 * @param item - The item to apply material to
 * @returns The item with a material property added
 */
function itemTraitsApply(item: Item): GeneratedItem {
	const materialCategory = materials[indexRandom(materials)];
	const material = materialCategory[indexRandom(materialCategory)];

	return {
		...item,
		material
	};
}

/**
 * Creates a single random item with random material from available items
 * @returns The generated item object, or null if no items available
 */
export function itemCreateRandom(): GeneratedItem | null {
	if (gameState.itemsAvailable.length === 0) {
		return null;
	}

	const item = gameState.itemsAvailable[indexRandom(gameState.itemsAvailable)];
	const generatedItem = itemTraitsApply(item);

	gameState.markItemUsed(generatedItem);

	return generatedItem;
}

/**
 * Creates a set of random items
 * @param amount - The number of items to generate
 * @returns An array of generated items (may be less than requested if items run out)
 */
export function itemCreateSet(amount: number): GeneratedItem[] {
	const itemSet: GeneratedItem[] = [];

	for (let i = 0; i < amount; i++) {
		const item = itemCreateRandom();
		if (item === null) {
			break; // No more items available
		}
		itemSet.push(item);
	}

	return itemSet;
}
