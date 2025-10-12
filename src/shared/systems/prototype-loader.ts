import { BaseSystem, ECSSystem, InjectType } from "@ecsframework/core";
import { EntityPrototypeSystem } from "@ecsframework/entity-prototype";
import { Flamework } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { IPrototype } from "@rbxts/prototype";
import { ReplicatedStorage, ServerStorage } from "@rbxts/services";
import { IS_SERVER } from "shared/utilities/constants";

type ModulePrototype = IPrototype & { Type: string };

const isPrototype = Flamework.createGuard<ModulePrototype>();
const isPrototypeArray = Flamework.createGuard<ModulePrototype[]>();

@ECSSystem({
	Priority: math.huge,
})
export class PrototypeLoader extends BaseSystem {
	@InjectType
	private prototypeSystem!: EntityPrototypeSystem;
	@InjectType
	private logger!: Logger;

	OnStartup(): void {
		const handler = this.prototypeSystem.GetHandler();
		const folders = this.getFolders();
		let counter = 0;
		this.logger.Debug(`Found ${folders.size()} folders`);

		folders.forEach((folder) => {
			const prototypes = this.loadPrototypes(folder);

			prototypes.forEach((prototype) => {
				handler.RegisterPrototype(prototype, prototype.Type);
			});

			counter += prototypes.size();
			this.logger.Debug(`Loaded ${prototypes.size()} prototypes from ${folder.GetFullName()}`);
		});

		handler.Compile();
		this.logger.Info(`Compiled ${counter} prototypes`);
	}

	private getPaths() {
		return IS_SERVER ? [ServerStorage, ReplicatedStorage] : [ReplicatedStorage];
	}

	private getFolders() {
		return this.getPaths()
			.map((path) => path.FindFirstChild("Prototypes") as Folder)
			.filterUndefined();
	}

	private parseModule(moduleScript: ModuleScript) {
		const content = require(moduleScript);

		if (isPrototype(content)) {
			return [content];
		}

		if (isPrototypeArray(content)) {
			return content;
		}

		return [];
	}

	private findAllModules(folder: Instance) {
		const allModules: ModuleScript[] = [];

		const recursiveFind = (child: Instance) => {
			if (child.IsA("ModuleScript")) {
				allModules.push(child);
				return;
			}

			child.GetChildren().forEach(recursiveFind);
		};

		recursiveFind(folder);

		return allModules;
	}

	private loadPrototypes(folder: Instance) {
		const allPrototypes: ModulePrototype[] = [];

		this.findAllModules(folder).forEach((child) => {
			this.parseModule(child).forEach((prototype) => {
				allPrototypes.push(prototype);
			});
		});

		return allPrototypes;
	}
}
