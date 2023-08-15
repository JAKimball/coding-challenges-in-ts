export const sequenceSum = (
	begin: number,
	end: number,
	step: number,
): number => {
	let result = 0;
	for (let i = begin; i <= end; i += step) {
		result += i;
	}

	return result;
};

export function solution(start: number, finish: number) {
	const distance = finish - start;
	return Math.floor(distance / 3) + (distance % 3);
}

solution(1, 5); // ?
solution(3, 3); // ?
solution(2, 4); // ?

// ============================

export function findUniq(arr: number[]): number {
	const map = new Map();
	arr.forEach((el) => {
		if (map.has(el)) {
			map.set(el, map.get(el) + 1);
		} else map.set(el, 1);
	});
	for (const el of arr) {
		if (map.get(el) === 1) {
			return el;
		}
	}

	return 0;
}

findUniq([1, 0, 0]) === 1; // ?
findUniq([0, 1, 0]) === 1; // ?
findUniq([0, 0, 1]) === 1; // ?
findUniq([1, 1, 1, 2, 1, 1]) === 2; // ?
findUniq([1, 1, 2, 1, 1]) === 2; // ?
findUniq([3, 10, 3, 3, 3]) === 10; // ?

// ============ June 20th, 2023 ============= //

function burner(c: number, h: number, o: number) {
	const water = Math.min(Math.floor(h / 2), o);
	h -= water * 2;
	o -= water;

	const co2 = Math.min(Math.floor(o / 2), c);
	o -= co2 * 2;
	c -= co2;

	const methane = Math.min(Math.floor(h / 4), c);

	return [water, co2, methane];
}

burner(45, 11, 100); //?

burner(354, 1023230, 0).toString() === [0, 0, 354].toString(); //?
burner(939, 3, 694).toString() === [1, 346, 0].toString(); //?
burner(215, 41, 82100).toString() === [20, 215, 0].toString(); //?
burner(113, 0, 52).toString() === [0, 26, 0].toString(); //?

burner(45, 11, 100).toString() === [5, 45, 0].toString(); //?
burner(354, 1023230, 0).toString() === [0, 0, 354].toString(); //?
burner(939, 3, 694).toString() === [1, 346, 0].toString(); //?
burner(215, 41, 82100).toString() === [20, 215, 0].toString(); //?
burner(113, 0, 52).toString() === [0, 26, 0].toString(); //?

// let timestring = "10:22:33";
// timestring[2]; //?

// convert number to string with leading zeros
const num = 5;
num.toString().padStart(2, "0"); //?
