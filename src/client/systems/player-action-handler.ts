import { BaseSystem, ECSSystem } from "@ecsframework/core";
import { Functions } from "client/network";
import { PlayerActionMetadata, RegisteredPlayerActions, ServerResponse } from "shared/player-actions/player-action";

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
}
