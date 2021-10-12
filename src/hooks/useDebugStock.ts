/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLayoutEffect, useRef } from 'react';

import { Stock } from './useStock';
import { version } from '../../package.json';

type StockedDebugData = {
    version: string;
    stocks: Record<number, { stock: Stock<any>; debugName?: string }>;
    counter: number;
};

declare global {
    interface Window {
        __STOCKED_DEBUG_DATA: StockedDebugData;
    }
}

const ensureDebugDataInitialized = () => {
    if (typeof window !== 'undefined' && typeof window.__STOCKED_DEBUG_DATA === 'undefined') {
        window.__STOCKED_DEBUG_DATA = {
            version,
            stocks: {},
            counter: 0,
        };
    }
};

export const useDebugStock = (stock: Stock<any>, debugName?: string) => {
    const stockId = useRef<number>();

    useLayoutEffect(() => {
        ensureDebugDataInitialized();

        stockId.current = ++window.__STOCKED_DEBUG_DATA.counter;

        window.__STOCKED_DEBUG_DATA.stocks[stockId.current] = {
            stock,
            debugName,
        };

        return () => {
            delete window.__STOCKED_DEBUG_DATA.stocks[stockId.current!];
            stockId.current = undefined;
        };
    }, []);

    if (stockId.current !== undefined) {
        window.__STOCKED_DEBUG_DATA.stocks[stockId.current].stock = stock;
        window.__STOCKED_DEBUG_DATA.stocks[stockId.current].debugName = debugName;
    }
};
