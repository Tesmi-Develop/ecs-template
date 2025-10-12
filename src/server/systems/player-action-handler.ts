import { BaseSystem, ECSSystem, InjectType, RobloxInstanceSystem } from "@ecsframework/core";
import { Logger } from "@rbxts/log";
import { Functions } from "server/network";
import { ReadyPlayerTag } from "shared/components/on-ready-player";
import {
	ActionExecutionMode,
	FailedProcessAction,
	PlayerActionMetadata,
	RegisteredPlayerActions,
	ServerResponse,
	ServerResponseCodes,
} from "shared/player-actions/player-action";

@ECSSystem()
export class PlayerActionHandler extends BaseSystem {
	@InjectType
	private robloxInstanceSystem!: RobloxInstanceSystem;

	@InjectType
	private logger!: Logger;
	private actions: Map<
		string,
		(player: Player, data: unknown) => ServerResponse<unknown> | Promise<ServerResponse<unknown>>
	> = new Map();
	private actionQueue: Map<
		Player,
		Map<
			string,
			{
				Resolve: (value: ServerResponse<unknown>) => void;
				Reject: (reason?: ServerResponse<unknown>) => void;
				data: unknown;
			}[]
		>
	> = new Map();
	private cooldowns: Map<Player, Set<string>> = new Map();

	OnStartup(): void {
		Functions.InvokeAction.setCallback(async (player, actionId, actionData) => {
			const entity = this.robloxInstanceSystem.GetEntityFromInstance(player);

			if (entity === undefined) {
				const message = `Tried to invoke action, when player has no entity`;
				this.logger.Debug(message);

				return FailedProcessAction(message, ServerResponseCodes.NoPlayerEntity);
			}

			if (!this.HasComponent<ReadyPlayerTag>(entity)) {
				const message = `Tried to invoke action, when player is not ready`;
				this.logger.Debug(message);
				return FailedProcessAction(message, ServerResponseCodes.NoPlayerReady);
			}

			if (!this.actions.has(actionId)) {
				const message = `Tried to invoke action, when action ${actionId} is not registered`;
				this.logger.Debug(message);
				return FailedProcessAction(message, ServerResponseCodes.NoActionRegistered);
			}

			const metadata = RegisteredPlayerActions.get(actionId)!;
			if (metadata.Options.ExecutionMode === ActionExecutionMode.Queue) {
				if (!metadata.Guard!(actionData)) {
					const message = `Tried to invoke action, when guard is not met`;
					this.logger.Debug(message);
					return FailedProcessAction(message, ServerResponseCodes.NoGuardMet);
				}

				return this.addInQueue(player, actionId, actionData);
			}

			if (this.cooldowns.has(player) && this.cooldowns.get(player)!.has(actionId)) {
				const message = `Tried to invoke action, when action ${metadata.Name} is on cooldown`;
				this.logger.Debug(message);
				return FailedProcessAction(message, ServerResponseCodes.HasCooldown);
			}

			if (!metadata.Guard!(actionData)) {
				const message = `Tried to invoke action, when guard is not met`;
				this.logger.Debug(message);
				return FailedProcessAction(message, ServerResponseCodes.NoGuardMet);
			}

			let cleanup: ((time: number) => Promise<void>) | undefined;
			if (metadata.Options.ExecutionMode === ActionExecutionMode.Sing) {
				cleanup = this.giveCooldown(player, actionId);
			}

			const result = this.actions.get(actionId)!(player, actionData);
			if (!Promise.is(result)) {
				cleanup?.(metadata.Options.Cooldown!);
				return result;
			}

			try {
				const value = await result;
				return value;
			} finally {
				cleanup?.(metadata.Options.Cooldown!);
			}
		});
	}

	private giveCooldown(player: Player, actionId: string) {
		const actions = this.cooldowns.get(player) ?? new Set();
		this.cooldowns.set(player, actions);
		actions.add(actionId);

		return async (time: number) => {
			if (time > 0) {
				task.wait(time);
			}

			actions.delete(actionId);
			if (actions.isEmpty()) {
				this.cooldowns.delete(player);
			}
		};
	}

	private playerInGame(player: Player) {
		const entity = this.robloxInstanceSystem.GetEntityFromInstance(player);
		if (entity === undefined) return false;

		return this.HasComponent<ReadyPlayerTag>(entity);
	}

	private async processActionQueue(player: Player, actionId: string) {
		const actions = this.actionQueue.get(player)?.get(actionId);
		if (!actions) return;

		if (actions.isEmpty()) {
			this.actionQueue.delete(player);
			return;
		}

		let currentAction = actions.shift()!;

		do {
			if (!this.playerInGame(player)) {
				this.actionQueue.delete(player);
				return;
			}

			const metadata = RegisteredPlayerActions.get(actionId)!;
			const callback = this.actions.get(actionId)!;

			const cleanup = this.giveCooldown(player, actionId);
			const [success, result] = pcall(() => callback(player, currentAction.data));

			if (!success) {
				cleanup(metadata.Options.Cooldown!);
				currentAction.Reject(FailedProcessAction(tostring(result), ServerResponseCodes.UnknowError));
				currentAction = actions.shift()!;
				continue;
			}

			if (!Promise.is(result)) {
				cleanup(metadata.Options.Cooldown!);
				currentAction.Resolve(result);
				currentAction = actions.shift()!;
				continue;
			}

			await result
				.then(currentAction.Resolve)
				.catch(currentAction.Reject)
				.finally(() => cleanup(metadata.Options.Cooldown!));

			currentAction = actions.shift()!;
		} while (currentAction !== undefined);

		if (actions.isEmpty()) {
			this.actionQueue.delete(player);
		}
	}

	private addInQueue(player: Player, actionId: string, actionData: unknown) {
		return new Promise<ServerResponse<unknown>>((resolve, reject) => {
			const actionQueues = this.actionQueue.get(player) ?? new Map();
			this.actionQueue.set(player, actionQueues);

			const queue = actionQueues.get(actionId) ?? [];
			const isNeedRun = !actionQueues.has(actionId);

			queue?.push({
				Resolve: resolve,
				Reject: reject,
				data: actionData,
			});

			actionQueues.set(actionId, queue);

			if (isNeedRun) {
				this.processActionQueue(player, actionId);
			}
		});
	}

	SetCallback<T extends PlayerActionMetadata<any, any>>(
		actionMetadata: T,
		callback: (
			player: Player,
			data: T["__DataType"],
		) => Promise<ServerResponse<T["__ReturnType"]>> | ServerResponse<T["__ReturnType"]>,
	) {
		if (this.actions.has(actionMetadata.Id)) {
			throw `Action with id ${actionMetadata.Id} is already registered`;
		}
		this.actions.set(actionMetadata.Id, callback);
	}
}
