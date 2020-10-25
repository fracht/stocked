import { useCallback } from 'react';
import { Stock } from './useStock';
import { useStockContext } from './useStockContext';
import { useStockValue } from './useStockValue';

type SetAction<V> = (value: V) => void;

/** Hook, returns tuple of value and value set action. */
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
