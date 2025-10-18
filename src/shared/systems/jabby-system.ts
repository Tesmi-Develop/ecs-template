import { BaseSystem, ECSSystem } from "@ecsframework/core";
import jabby from "@rbxts/jabby";
import { RunService, UserInputService } from "@rbxts/services";

@ECSSystem()
export class JabbySystem extends BaseSystem {
	OnStartup(): void {
		const prefix = RunService.IsServer() ? "[Server]" : "[Client]";

		jabby.register({
			applet: jabby.applets.world,
			configuration: {
				world: this.world,
			},
			name: `${prefix} World`,
		});

		jabby.set_check_function(() => true);

		if (RunService.IsClient()) {
			let mounted = false;
			const client = jabby.obtain_client();
			UserInputService.InputBegan.Connect((input, gpe) => {
				if (gpe || input.KeyCode !== Enum.KeyCode.F4) {
					return;
				}

				if (mounted) {
					client.unmount_all();

					mounted = false;
					return;
				}

				client.spawn_app(client.apps.home);
				mounted = true;
			});
		}
	}
}
