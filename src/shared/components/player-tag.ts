import { ECSComponent } from "@ecsframework/core";
import { Replicated } from "@ecsframework/replicator";

@Replicated()
@ECSComponent({
	IsTag: true,
})
export class PlayerTag {}
