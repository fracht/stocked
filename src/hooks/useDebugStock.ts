/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect } from 'react';
import { getPxthSegments } from 'pxth';

import { Stock } from './useStock';

declare global {
	interface Window {
		__STOCKED_DEVTOOLS_HOOK?: {
			raiseEvent: (event: string, data: any) => void;
		};
	}
}

enum StockedEvent {
	NEW = 'new',
	BATCH_UPDATE = 'update',
}

let stockIndex = -1;

export const useDebugStock = <T extends object>(stock: Stock<T>) => {
	useEffect(() => {
		if (window.__STOCKED_DEVTOOLS_HOOK) {
			const currentStockId = ++stockIndex;
			window.__STOCKED_DEVTOOLS_HOOK!.raiseEvent(StockedEvent.NEW, {
				data: stock.getValues(),
				id: currentStockId,
			});

			return stock.watchBatchUpdates((data) =>
				window.__STOCKED_DEVTOOLS_HOOK!.raiseEvent(StockedEvent.BATCH_UPDATE, {
					data: {
						...data,
						origin: getPxthSegments(data.origin),
					},
					id: currentStockId,
				}),
			);
		}

		return () => {
			/** empty fn */
		};
	}, []);
};
