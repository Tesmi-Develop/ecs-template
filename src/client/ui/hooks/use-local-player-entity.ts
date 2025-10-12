import { RobloxInstanceComponent } from "@ecsframework/core";
import { useEffect, useMemo, useState } from "@rbxts/react";
import { Players } from "@rbxts/services";
import { PlayerTag } from "shared/components/player-tag";
import { useSystem } from "./use-system";

export function useLocalPlayerEntity() {
	const system = useSystem();
	const [value, setValue] = useState(
		useMemo(() => {
			for (const [entity] of system.Query<[PlayerTag]>()) {
				const robloxInstance = system.GetComponent<RobloxInstanceComponent>(entity);
				if (robloxInstance && robloxInstance.Instance === Players.LocalPlayer) return entity;
			}
		}, [])!,
	);

	useEffect(() => {
		const unsubscribe = system.Added<PlayerTag>().connect((entity) => {
			const robloxInstance = system.GetComponent<RobloxInstanceComponent>(entity);
			if (!robloxInstance || robloxInstance.Instance !== Players.LocalPlayer) return;

			setValue(entity);
		});

		const unsubscribe2 = system.Changed<PlayerTag>().connect((entity) => {
			const robloxInstance = system.GetComponent<RobloxInstanceComponent>(entity);
			if (!robloxInstance || robloxInstance.Instance !== Players.LocalPlayer) return;

			setValue(entity);
		});

		return () => {
			unsubscribe();
			unsubscribe2();
		};
	}, []);

	return value;
}
