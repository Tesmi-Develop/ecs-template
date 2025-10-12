import { ECSComponent } from "@ecsframework/core";
import { Replicated } from "@ecsframework/replicator";

@Replicated()
@ECSComponent()
export class PlayerTag {}
