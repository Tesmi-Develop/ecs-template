import { BaseSystem, ECSSystem, InjectType } from "@ecsframework/core";
import { SuccessProcessAction } from "shared/player-actions/player-action";
import { PingAction } from "shared/player-actions/test-action";
import { PlayerActionHandler } from "./player-action-handler";

@ECSSystem()
export class TestAction extends BaseSystem {
	@InjectType
	private playerActionHandler!: PlayerActionHandler;

	OnStartup(): void {
		this.playerActionHandler.SetCallback(PingAction, async (player, data) => {
			print("Start");
			task.wait(1);
			print("End");

			return SuccessProcessAction();
		});
	}
}
