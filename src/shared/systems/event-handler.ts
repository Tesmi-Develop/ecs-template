import { BaseSystem, ComponentKey, ECSSystem, Entity } from "@ecsframework/core";
import { EventTagComponent } from "shared/components/event-tag-component";

type EventArray = [
	{
		IsDeferred: boolean;
		Id: string;
	},
	unknown,
][];

@ECSSystem({
	Priority: -math.huge,
})
export class EventHandler extends BaseSystem {
	private firedEvents: Map<Entity, string[]> = new Map();
	private queueEvents: Map<Entity, EventArray> = new Map();
	private events = new Set<string>();

	OnStartup(): void {
		for (const [componentRuntimeId] of this.Query<[EventTagComponent]>()) {
			const eventKey = this.GetComponentKey(componentRuntimeId) as ComponentKey<string>;
			if (!eventKey) continue;

			this.events.add(eventKey);
			this.Added(eventKey).connect((entity) => {
				const events = this.firedEvents.get(entity) ?? [];
				events.push(eventKey);

				this.firedEvents.set(entity, events);
			});
		}
	}

	public IsEventComponent(id: string) {
		return this.events.has(id);
	}

	private pickEvent(events: EventArray) {
		if (events.isEmpty()) return;

		for (const [index, eventInfo] of pairs(events)) {
			if (eventInfo[0].IsDeferred) {
				eventInfo[0].IsDeferred = false;
				continue;
			}

			return [index - 1, eventInfo] as const;
		}
	}

	/** @metadata macro */
	public Fire<T>(entity: Entity, data: T, componentId?: ComponentKey<T>) {
		if (!componentId) {
			throw "No component id provided";
		}

		const events = this.queueEvents.get(entity) ?? [];
		this.queueEvents.set(entity, events);

		events.push([{ IsDeferred: false, Id: componentId! }, data]);
	}

	/** @metadata macro */
	public FireDefer<T>(entity: Entity, data: T, componentId?: ComponentKey<T>) {
		if (!componentId) {
			throw "No component id provided";
		}

		const events = this.queueEvents.get(entity) ?? [];
		this.queueEvents.set(entity, events);

		events.push([{ IsDeferred: true, Id: componentId! }, data]);
	}

	/** @metadata macro */
	public On<T>(componentId?: ComponentKey<T>) {
		return this.Added(componentId);
	}

	OnUpdate(): void {
		for (const [entity, events] of this.firedEvents) {
			this.firedEvents.delete(entity);

			for (const eventId of events) {
				this.RemoveComponent(entity, eventId as ComponentKey<unknown>);
			}
		}

		for (const [entity, events] of this.queueEvents) {
			const pickedEvent = this.pickEvent(events);
			if (!pickedEvent) continue;

			const [eventIndex, eventInfo] = pickedEvent;
			if (this.HasComponent(entity, eventInfo[0].Id as ComponentKey<unknown>)) continue;

			this.SetComponent(entity, eventInfo[1], eventInfo[0].Id as ComponentKey<unknown>);
			events.remove(eventIndex);

			if (events.isEmpty()) {
				this.queueEvents.delete(entity);
			}
		}
	}
}
