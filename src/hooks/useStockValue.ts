import { useEffect, useState } from 'react';
import get from 'lodash/get';

import { Stock } from './useStock';
import { useStockContext } from './useStockContext';

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
