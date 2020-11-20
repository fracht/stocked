import { useEffect, useMemo, useReducer } from 'react';
import get from 'lodash/get';

import { Stock } from './useStock';
import { useStockContext } from './useStockContext';

/**
 * Hook, which returns *actual* stock value.
 * This means, it will update component each time when value in stock changes.
 * @param path  - path to variable in stock, deeply gets value. @see https://lodash.com/docs/4.17.15#get
 * @param stock - optional parameter, if you want to work with custom stock, not received from context.
 */
export const useStockValue = <V, T extends object = object>(path: string, stock?: Stock<T>): V => {
    if (!stock) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        stock = useStockContext<T>();
    }

    const { observe, stopObserving, values } = stock;

    const [renderId, forceUpdate] = useReducer(val => val + 1, 0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const value = useMemo(() => get(values.current, path), [values, path, renderId]);

    useEffect(() => {
        const observerKey = observe(path, forceUpdate);
        return () => stopObserving(path, observerKey);
    }, [path, observe, stopObserving, values]);

    return value;
};
