import { ComponentKey, Entity } from "@ecsframework/core";
import { useEffect, useMemo, useState } from "@rbxts/react";
import { PlayerTag } from "shared/components/player-tag";
import { useSystem } from "./use-system";

/** @metadata macro */
export function useEntitiesFromComponent<T>(componentKey?: ComponentKey<T>) {
	const system = useSystem();
	const [value, setValue] = useState(
		useMemo(() => {
			const entities = [] as Entity[];

			for (const [entity] of system.Query([componentKey] as never)) {
				entities.push(entity);
			}

			return entities;
		}, []),
	);

	useEffect(() => {
		const unsubscribe = system.Added(componentKey).connect((entity) => {
			setValue([...value, entity]);
		});

		const unsubscribe2 = system.Removed<PlayerTag>().connect((entity) => {
			setValue(value.filter((e) => e !== entity));
		});

		return () => {
			unsubscribe();
			unsubscribe2();
		};
	}, []);

	return value;
}
