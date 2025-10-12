import { Players } from "@rbxts/services";

/** @server */
export const GetPlayerFromPart = (part: BasePart) => {
	const model = part.FindFirstAncestorOfClass("Model");
	if (!model) return;

	const player = Players.GetPlayerFromCharacter(model);
	if (!player) return;

	return player;
};

export const GetCharactersFromHits = (hitsList: BasePart[], onlyHumanoidRootPart = false) => {
	type Character = Model & { Humanoid: Humanoid };
	const characters = new Set<Character>();

	hitsList.forEach((hit) => {
		if (onlyHumanoidRootPart && hit.Name !== "HumanoidRootPart") return;

		const character = hit.FindFirstAncestorOfClass("Model");
		const humanoid = character?.FindFirstChildOfClass("Humanoid");

		if (!character || characters.has(character as Character)) return;
		if (!humanoid || humanoid.Health <= 0) return;

		characters.add(character as Character);
	});

	return characters;
};

export const GetPlayersFromHits = (hitsList: BasePart[], onlyHumanoidRootPart = false) => {
	const players = new Set<Player>();

	hitsList.forEach((hit) => {
		if (onlyHumanoidRootPart && hit.Name !== "HumanoidRootPart") return;

		const character = hit.FindFirstAncestorOfClass("Model");
		const humanoid = character?.FindFirstChildOfClass("Humanoid");
		const player = Players.GetPlayerFromCharacter(character);

		if (!character || !player || players.has(player)) return;
		if (!humanoid || humanoid.Health <= 0) return;

		players.add(player);
	});

	return players;
};
