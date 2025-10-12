import { useBindingListener } from "@rbxts/pretty-react-hooks";
import React, { useBinding, useEffect } from "@rbxts/react";
import { useAtom } from "@rbxts/react-charm";
import { setTimeout } from "@rbxts/set-timeout";
import { Pages } from "../settings/pages";
import { StorePage } from "../stores/page-store";
import { useAtomBinding } from "./use-atom-binding";

export const usePage = (page: Pages, timeToClose?: number, onChangedState?: (isOpen: boolean) => void) => {
	const previosPage = useAtom(() => StorePage().PreviosPage);
	const currentPage = useAtom(() => StorePage().Page);
	const isOpen = page === currentPage;

	const [visible, setVisible] = React.useState(isOpen);

	useEffect(() => {
		onChangedState?.(isOpen);

		if (timeToClose !== undefined && !isOpen && previosPage === page) {
			return setTimeout(() => {
				setVisible(false);
			}, timeToClose);
		}

		setVisible(isOpen);
	}, [isOpen]);

	return visible;
};

export const usePageBinding = (page: Pages, timeToClose?: number, onChangedState?: (isOpen: boolean) => void) => {
	const previosPage = useAtomBinding(() => StorePage().PreviosPage);
	const currentPage = useAtomBinding(() => StorePage().Page);
	const [visible, setVisible] = useBinding(currentPage.getValue() === page);

	useBindingListener(currentPage, (currentPage) => {
		const isOpen = page === currentPage;
		onChangedState?.(isOpen);

		if (timeToClose !== undefined && !isOpen && previosPage.getValue() === page) {
			return setTimeout(() => {
				setVisible(false);
			}, timeToClose);
		}

		setVisible(isOpen);
	});

	return visible;
};
