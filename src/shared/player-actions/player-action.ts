import { Modding } from "@flamework/core";
import { t } from "@rbxts/t";

export interface PlayerActionMetadata<Data, ReturnType> {
	__DataType: Data;
	__ReturnType: ReturnType;
	Id: string;
	Name: string;
	Guard: t.check<Data>;
	Options: PlayerActionOptions;
}

export const RegisteredPlayerActions = new Map<string, PlayerActionMetadata<unknown, unknown>>();
export const enum ActionExecutionMode {
	Sing,
	Queue,
	Parallel,
}

interface IServerResponse<B extends boolean, T> {
	success: B;
	message: T;
	code: number;
}

export type ServerResponseError = IServerResponse<false, string>;
export type ServerResponse<T = undefined> = IServerResponse<true, T> | ServerResponseError;

export const enum ServerResponseCodes {
	Success = 0,
	UnknowError = 1,
	NoPlayerEntity = 2,
	NoPlayerReady = 3,
	NoActionRegistered = 4,
	NoGuardMet = 5,
	HasCooldown = 6,
}

export const FailedProcessAction = (
	message = "",
	code: number = ServerResponseCodes.UnknowError,
): ServerResponseError => {
	return {
		success: false,
		message: message,
		code: math.max(code, 1),
	};
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SuccessProcessAction = <T extends [undefined?] | [any] = [any]>(...value: T): ServerResponse<T[0]> => {
	return {
		success: true,
		message: (value as unknown[])[0],
		code: 0,
	};
};

interface PlayerActionOptions {
	ExecutionMode?: ActionExecutionMode;
	Cooldown?: number;
}

/** @metadata macro */
export function PlayerAction<T, R = void>(
	options?: PlayerActionOptions,
	actionId?: Modding.Generic<T, "id">,
	actionName?: Modding.Generic<T, "text">,
	guard?: Modding.Generic<T, "guard">,
) {
	const metadata: PlayerActionMetadata<T, R> = {
		__DataType: {} as T,
		__ReturnType: {} as R,
		Id: actionId!,
		Name: actionName!,
		Options: {
			ExecutionMode: options?.ExecutionMode ?? ActionExecutionMode.Parallel,
			Cooldown: options?.Cooldown ?? 0,
		},
		Guard: guard!,
	};

	RegisteredPlayerActions.set(actionId!, metadata);
	return metadata;
}
