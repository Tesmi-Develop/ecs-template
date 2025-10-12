import { ECSComponent } from "@ecsframework/core";
import { Replicated } from "@ecsframework/replicator";
import { Event } from "shared/decorators/event";

@Event()
@ECSComponent()
@Replicated()
export class EventTest {
	public SomeData = 1;
}
