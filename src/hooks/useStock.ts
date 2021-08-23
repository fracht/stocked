import { useCallback, useMemo } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import isFunction from 'lodash/isFunction';

import { ObserversControl, ROOT_PATH, useObservers } from './useObservers';
import { SetStateAction } from '../typings/SetStateAction';
import { getOrReturn, normalizePath, setOrReturn } from '../utils/pathUtils';
import { useLazyRef } from '../utils/useLazyRef';

export type Stock<T extends object> = {
    /** Function for setting value. Deeply sets value, using path to variable. @see https://lodash.com/docs/4.17.15#set */
    setValue: (path: string | typeof ROOT_PATH, value: SetStateAction<unknown>) => void;
    /** Function for setting all values. */
    setValues: (values: T) => void;
    /** Get actual value from stock. */
    getValue: <V>(path: string | typeof ROOT_PATH) => V;
    /** Get all values from stock */
    getValues: () => T;
    /** Function for resetting values to initial state */
    resetValues: () => void;
} & Omit<ObserversControl<T>, 'notifyAll' | 'notifySubTree'>;

export type StockConfig<T extends object> = {
    initialValues: T;
};

/**
 * Creates stock.
 *
 * Use it only if you want to use several Stock's at the same time.
 *
 * Instead, use `<StockRoot>` component
 *
 * @param config - configuration of Stock.
 */
export const useStock = <T extends object>({ initialValues }: StockConfig<T>): Stock<T> => {
    const values = useLazyRef<T>(() => cloneDeep(initialValues));
    const { notifySubTree, notifyAll, watch, watchAll, watchBatchUpdates, isObserved } = useObservers<T>();

    const setValue = useCallback(
        (path: string | typeof ROOT_PATH, action: SetStateAction<unknown>) => {
            path = normalizePath(path as string);

            const value = isFunction(action) ? action(getOrReturn(values.current, path)) : action;

            values.current = setOrReturn(values.current, path, value) as T;

            notifySubTree(path, values.current);
        },
        [values, notifySubTree]
    );

    const setValues = useCallback(
        (newValues: T) => {
            values.current = newValues;
            notifyAll(newValues);
        },
        [values, notifyAll]
    );

    const getValue = useCallback(<V>(path: string | typeof ROOT_PATH) => getOrReturn(values.current, path) as V, [
        values,
    ]);

    const getValues = useCallback(() => values.current, [values]);

    const resetValues = useCallback(() => setValues(cloneDeep(initialValues)), [initialValues, setValues]);

    const stock: Stock<T> = useMemo(
        () => ({
            getValue,
            getValues,
            setValue,
            setValues,
            resetValues,
            watch,
            watchAll,
            watchBatchUpdates,
            isObserved,
        }),
        [getValue, getValues, setValue, setValues, resetValues, watch, watchAll, watchBatchUpdates, isObserved]
    );

    return stock;
};
