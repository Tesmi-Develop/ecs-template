import { Selector, subscribe } from "@rbxts/charm";
import { useBinding, useEffect } from "@rbxts/react";

export function useAtomBinding<T>(callback: Selector<T>) {
	const [state, setState] = useBinding(callback());

	useEffect(() => {
		setState(callback());
		return subscribe(callback, setState);
	}, []);

	return state;
}
