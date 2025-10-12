import React, { PropsWithChildren } from "@rbxts/react";

export function Canvas(props: PropsWithChildren) {
	return (
		<screengui ResetOnSpawn={false} IgnoreGuiInset={true}>
			{props.children}
		</screengui>
	);
}
