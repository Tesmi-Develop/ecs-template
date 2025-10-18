import { BaseSystem, ECSSystem, RobloxInstanceComponent } from "@ecsframework/core";
import { Players } from "@rbxts/services";
import { PlayerTag } from "shared/components/player-tag";

@ECSSystem({ Priority: math.huge })
export class InitLocalPlayerSystem extends BaseSystem {
	OnStartup(): void {
		this.SpawnEntity<[RobloxInstanceComponent, PlayerTag]>([
			{
				Instance: Players.LocalPlayer,
			},
		]);
	}
}
