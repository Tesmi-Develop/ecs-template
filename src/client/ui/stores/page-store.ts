import { atom } from "@rbxts/charm";
import { Pages } from "../settings/pages";

interface PageStore {
	Page: Pages;
	PreviosPage: Pages;
	IsLocked: boolean;
}

export const StorePage = atom<PageStore>({
	Page: Pages.None,
	PreviosPage: Pages.None,
	IsLocked: false,
});
