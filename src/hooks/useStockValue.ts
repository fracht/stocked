import { useEffect, useState } from 'react';
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

    const [value, setValue] = useState(() => get(values.current, path));

    useEffect(() => {
        setValue(get(values.current, path));
        const observer = (value: V) => setValue(value);
        observe(path, observer);
        return () => stopObserving(path, observer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path, observe, stopObserving, values]);

    return value;
};
