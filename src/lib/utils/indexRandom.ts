export function indexRandom(arr: any[]): number {
	const max = arr.length - 1;
	const index = Math.floor(Math.random() * (max + 1));
	return index;
}
