import { useEffect, useReducer } from 'react';

import { Stock } from './useStock';
import { StockProxy } from '../typings';
import { useStockContext } from './useStockContext';
import { useLazyRef } from '../utils/useLazyRef';

export const useAllStockValues = <T extends object = object>(customStock?: Stock<T>, proxy?: StockProxy) => {
    const stock = useStockContext(customStock, proxy);

    const { watchAll, getValues } = stock;

    const [, forceUpdate] = useReducer(val => val + 1, 0);

    const value = useLazyRef<T>(() => getValues());

    useEffect(
        () =>
            watchAll((newValue: T) => {
                value.current = newValue;
                forceUpdate();
            }),
        [watchAll, value]
    );

    return value.current;
};
