import { BaseSystem, ECSSystem, InjectType } from "@ecsframework/core";
import { ReplicationSystem } from "@ecsframework/replicator";
import { Events } from "server/network";

@ECSSystem()
export class NetworkSystem extends BaseSystem {
	@InjectType
	private replicationSystem!: ReplicationSystem;

	OnStartup(): void {
		this.replicationSystem.OnSync.Connect((player, data) => {
			Events.OnSyncECSData.fire(player, data);
		});

		Events.OnReady.connect((player) => {
			this.replicationSystem.ConnectPlayerOnFirstConnection(player);
		});

		Events.OnEntityConnect.connect((player, entity) => {
			this.replicationSystem.ConnectPlayerToEntity(player, entity);
		});
	}
}
