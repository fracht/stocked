import { useCallback } from 'react';
import { Stock } from './useStock';
import { useStockContext } from './useStockContext';
import { useStockValue } from './useStockValue';

type SetAction<V> = (value: V) => void;

/**
 * Hook, returns tuple of value and value set action.
 * Returns *actual* value.
 * This means, this hook fires re-render each time value in stock was changed.
 * Similar to standard React's `useState` hook.
 * @param path  - path to variable in stock, deeply gets value. @see https://lodash.com/docs/4.17.15#get
 * @param stock - optional parameter, if you want to work with custom stock, not received from context.
 */
export const useStockState = <V, T extends object = object>(path: string, stock?: Stock<T>): [V, SetAction<V>] => {
    if (!stock) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        stock = useStockContext<T>();
    }

    const value = useStockValue<V, T>(path, stock);

    const { setValue } = stock;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const set = useCallback((value: V) => setValue(path, value), [path, setValue]);

    return [value, set];
};
