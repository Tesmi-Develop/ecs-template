import { BaseSystem } from "@ecsframework/core";
import React, { useState } from "@rbxts/react";
import { PlayerGui } from "shared/utilities/constants";
import { useScalerApi } from "../hooks/scaler/context";
import { Canvas } from "../utility-components/canvas";
import { SystemProvider } from "../utility-components/system-provider";
import { AppContext } from "./app-context";
import { withScaler } from "../wrappers/with-scaler";
import { MainApp } from "./main";

export const ScreenGUIName = "react-root";

export const App = (system: BaseSystem) => {
	return withScaler(() => {
		const scalerApi = useScalerApi();
		const [ref, setRef] = useState<ScreenGui>();

		return (
			<AppContext.Provider value={{ ScreenGui: ref!, PlayerGui: PlayerGui, ScalerApi: scalerApi }}>
				<SystemProvider.Provider value={{ system }}>
					<Canvas Key={ScreenGUIName} ref={setRef} ignoreGuiInset={true}>
						{ref ? (
							<>
								<uiscale Scale={scalerApi.scale} key={"app-scaler"} />
								<MainApp />
							</>
						) : (
							<></>
						)}
					</Canvas>
				</SystemProvider.Provider>
			</AppContext.Provider>
		);
	});
};
