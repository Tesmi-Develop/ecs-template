import { useContext } from "@rbxts/react";
import { SystemProvider } from "../utility-components/system-provider";

export function useSystem() {
	const context = useContext(SystemProvider);
	assert(context, "Hooks can only be used within a provider.");
	return context.system;
}
