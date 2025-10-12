import { BaseSystem, ComponentKey, ECSSystem, InjectType } from "@ecsframework/core";
import { ReceiveReplicationSystem, RemoveTag, SyncData } from "@ecsframework/replicator";
import { Events } from "client/network";
import { EventHandler } from "shared/systems/event-handler";

@ECSSystem({
	Priority: -math.huge,
})
export class NetworkSystem extends BaseSystem {
	@InjectType
	private replicationSystem!: ReceiveReplicationSystem;

	@InjectType
	private eventHandler!: EventHandler;

	private fireEvents(data: SyncData) {
		for (const [entity, components] of pairs(data)) {
			if ((components as RemoveTag)["__removed"]) continue;
			for (const [id, componentData] of pairs(components as Map<string, Record<string, unknown>>)) {
				if (!this.eventHandler.IsEventComponent(id)) continue;
				(components as Map<string, Record<string, unknown>>).delete(id);

				if ((componentData as RemoveTag)["__removed"]) continue;
				this.eventHandler.Fire(
					this.replicationSystem.GetClientEntity(entity),
					componentData["data"],
					id as ComponentKey<unknown>,
				);
			}

			if ((components as Map<string, Record<string, unknown>>).isEmpty()) {
				data.delete(entity);
			}
		}
	}

	OnStartup(): void {
		Events.OnSyncECSData.connect((data) => {
			this.fireEvents(data);
			this.replicationSystem.Sync(data);
		});

		this.replicationSystem.OnEntityConnect.Connect((entity) => {
			Events.OnEntityConnect.fire(entity);
		});

		Events.OnReady.fire();
	}
}
