import { BaseSystem, ECSSystem, InjectType, RobloxInstanceComponent } from "@ecsframework/core";
import { SavingSystem } from "@ecsframework/player-data-handler";
import { Players } from "@rbxts/services";
import { PlayerProfile } from "server/other/player-profile";
import { ReadyPlayerTag } from "shared/components/on-ready-player";
import { PlayerTag } from "shared/components/player-tag";

@ECSSystem()
export class PlayerDataSystem extends BaseSystem {
	@InjectType
	private savingSystem!: SavingSystem;

	OnStartup(): void {
		this.savingSystem.SetProfileWrapper(PlayerProfile);

		Players.PlayerAdded.Connect((player) => {
			const entity = this.SpawnEntity<[RobloxInstanceComponent, PlayerTag]>([
				{
					Instance: player,
				},
			]);

			this.savingSystem.LoadProfile(player, entity).then(() => {
				this.SetComponent<ReadyPlayerTag>(entity, {});
			});
		});

		Players.PlayerRemoving.Connect((player) => {
			this.savingSystem.CloseProfile(player);
		});
	}
}
