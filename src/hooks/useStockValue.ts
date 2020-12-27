import { useContext, useEffect, useReducer } from 'react';
import get from 'lodash/get';

import { Stock } from './useStock';
import { StockContext } from '../components';
import invariant from 'tiny-invariant';
import { useLazyRef } from '../utils/useLazyRef';

/**
 * Hook, which returns *actual* stock value.
 * This means, it will update component each time when value in stock changes.
 * @param path  - path to variable in stock, deeply gets value. @see https://lodash.com/docs/4.17.15#get
 * @param stock - optional parameter, if you want to work with custom stock, not received from context.
 */
export const useStockValue = <V, T extends object = object>(path: string, stock?: Stock<T>): V => {
    const stockContext = (useContext(StockContext) as unknown) as Stock<T> | undefined;

    stock = stock ?? stockContext;

    invariant(stock, "You're trying to access stock state outside stock context and without providing custom stock.");

    const { observe, stopObserving, values } = stock;

    const [, forceUpdate] = useReducer(val => val + 1, 0);

    const value = useLazyRef<V>(() => get(values.current, path));

    useEffect(() => {
        const observerKey = observe(path, (newValue: V) => {
            value.current = newValue;
            forceUpdate();
        });
        return () => stopObserving(path, observerKey);
    }, [path, observe, stopObserving, values, value]);

    return value.current;
};
