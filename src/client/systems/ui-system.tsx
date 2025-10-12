import { BaseSystem, ECSSystem, Entity, RobloxInstanceComponent } from "@ecsframework/core";
import React from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import { Players } from "@rbxts/services";
import { MainApp } from "client/ui/app/main";
import { Canvas } from "client/ui/canvas";
import { SystemProvider } from "client/ui/utility-components/system-provider";
import { ReadyPlayerTag } from "shared/components/on-ready-player";

const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui") as PlayerGui;

@ECSSystem({
	Priority: -math.huge,
})
export class UISystem extends BaseSystem {
	private root = createRoot(new Instance("Folder"));

	private isLocalPlayerEntity(entity: Entity): boolean {
		const instanceData = this.GetComponent<RobloxInstanceComponent>(entity);
		return instanceData !== undefined && instanceData.Instance === Players.LocalPlayer;
	}

	OnEffect(): void {
		for (const [entity] of this.QueryChange<ReadyPlayerTag>()) {
			if (this.isLocalPlayerEntity(entity)) {
				this.root.render(
					createPortal(
						<SystemProvider.Provider value={{ system: this }}>
							<Canvas>
								<MainApp />
							</Canvas>
						</SystemProvider.Provider>,
						playerGui,
					),
				);
				return;
			}
		}
	}
}
