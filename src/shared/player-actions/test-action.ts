import { ActionExecutionMode, PlayerAction } from "./player-action";

interface PingAction {
	PingData: number;
}

export const PingAction = PlayerAction<PingAction>({
	ExecutionMode: ActionExecutionMode.Parallel,
	Cooldown: 1,
});
