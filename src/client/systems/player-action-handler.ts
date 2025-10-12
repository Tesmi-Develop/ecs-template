import { BaseSystem, ECSSystem } from "@ecsframework/core";
import { Functions } from "client/network";
import { PlayerActionMetadata, RegisteredPlayerActions, ServerResponse } from "shared/player-actions/player-action";
import { PingAction } from "shared/player-actions/test-action";

@ECSSystem()
export class PlayerActionHandler extends BaseSystem {
	/** @metadata macro */
	public async SendAction<M extends PlayerActionMetadata<any, any>>(actionMetadata: M, data: M["__DataType"]) {
		if (!RegisteredPlayerActions.has(actionMetadata.Id)) {
			throw `No action registered with id ${actionMetadata.Id}`;
		}

		const [success, result] = Functions.InvokeAction(actionMetadata.Id!, data).await();
		if (!success) {
			throw `Failed to invoke action with id ${actionMetadata.Id}, result: ${result}`;
		}

		return result as ServerResponse<M["__ReturnType"]>;
	}

	OnStartup(): void {
		task.delay(5, () => {
			print("Sending actions");
			for (let index = 0; index < 5; index++) {
				this.SendAction(PingAction, {
					PingData: 1,
				}).then((result) => print(result, index));
			}

			task.wait(6);
			print("Sending actions again");
			for (let index = 0; index < 5; index++) {
				this.SendAction(PingAction, {
					PingData: 1,
				}).then((result) => print(result, index));
			}
		});
	}
}
