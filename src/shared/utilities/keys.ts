import { Modding } from "@flamework/core";

/** @metadata macro */
export function getkeys<T extends object>(data?: Modding.Many<(keyof T)[]>): (keyof T)[] {
	return data!;
}
