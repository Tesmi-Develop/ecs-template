import { ECSFramework } from "@ecsframework/core";
import { Flamework } from "@flamework/core";
import Log, { Logger } from "@rbxts/log";
import { LoggerContext } from "@rbxts/log/out/Logger";
import { SetupLogger } from "shared/utilities/setup-logger";
import planckJabby from "@rbxts/planck-jabby";
import("@ecsframework/replicator").expect();
import("@ecsframework/entity-prototype").expect();

Flamework.addPaths("src/server");
Flamework.addPaths("src/shared");

const framework = new ECSFramework();
framework.Container.Register<Logger>((context: unknown) => {
	SetupLogger();

	if (typeIs(context, "table") && "new" in context && "constructor" in context) {
		return Log.ForContext(context as LoggerContext);
	}

	return Log.ForContext({
		toString() {
			return "Unknown";
		},
	});
});
framework.Scheduler.addPlugin(new planckJabby());
framework.Start();
