import { ECSComponent, RobloxInstanceComponent } from "@ecsframework/core";
import { Replicated } from "@ecsframework/replicator";

@Replicated({
	resolvePlayerConnection: (player, entity, data, system) => {
		const instanceData = system.GetComponent<RobloxInstanceComponent>(entity);
		return instanceData?.Instance === player;
	},
})
@ECSComponent({
	IsTag: true,
})
export class ReadyPlayerTag {}
