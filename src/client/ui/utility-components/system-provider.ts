import { BaseSystem } from "@ecsframework/core";
import { createContext, PropsWithChildren } from "@rbxts/react";

type SystemProviderProps = PropsWithChildren<{
	system: BaseSystem;
}>;

export const SystemProvider = createContext<SystemProviderProps>(undefined!);
