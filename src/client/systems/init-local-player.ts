import { BaseSystem, ECSSystem, InjectType, RobloxInstanceComponent } from "@ecsframework/core";
import { Players } from "@rbxts/services";
import { EventTest } from "shared/components/events/event-test";
import { PlayerTag } from "shared/components/player-tag";
import { EventHandler } from "shared/systems/event-handler";

@ECSSystem({ Priority: math.huge })
export class InitLocalPlayerSystem extends BaseSystem {
	@InjectType
	private eventHandler!: EventHandler;
	OnStartup(): void {
		this.SpawnEntity<[RobloxInstanceComponent, PlayerTag]>([
			{
				Instance: Players.LocalPlayer,
			},
		]);
	}
}
