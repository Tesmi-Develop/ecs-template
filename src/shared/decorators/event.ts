import { ComponentKey, DefineClassComponentMeta } from "@ecsframework/core";
import { Flamework, Modding } from "@flamework/core";
import { EventTagComponent } from "shared/components/event-tag-component";

const eventTagId = Flamework.id<EventTagComponent>();

/** @metadata macro */
export function Event<T>(id?: Modding.Generic<T, "id">) {
	return (_: T) => {
		DefineClassComponentMeta(id!, true, eventTagId as ComponentKey<unknown>);
	};
}
