import { MutableRefObject, useCallback } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';
import isFunction from 'lodash/isFunction';

import { useLazyRef } from '../utils/useLazyRef';
import { Observer } from '../typings/Observer';
import { SetStateAction } from '../typings/SetStateAction';
import { ObserverArray, ObserverKey } from '../utils/ObserverArray';
import { ObserversControl, useObservers } from './useObservers';
import { getOrReturn, normalizePath } from '../utils/pathUtils';

export type Stock<T extends object> = {
    /**
     * Reference to actual values.
     *
     * **WARN:** do not try to mutate those values, or use them for display.
     *
     * For changing value use `setValue` and `setValues` instead.
     *
     * For accessing variable use `useStockValue` or `useStockState` or, if you
     * want to provide custom logic, subscribe to changes via `observe` and remember
     * to do cleanup via `stopObserving`.
     *
     * Why it is so complicated? Because of performance issues, stock not updates directly
     * values, what will cause whole app re-render. Instead, it uses observers to re-render only necessary parts.
     *
     * Read more about it here -> https://github.com/ArtiomTr/stocked#readme
     */
    values: Readonly<MutableRefObject<T>>;
    /** Function for setting value. Deeply sets value, using path to variable. @see https://lodash.com/docs/4.17.15#set */
    setValue: (path: string, value: unknown) => void;
    /** Function for setting all values. */
    setValues: (values: T) => void;
    /** Function for resetting values to initial state */
    resetValues: () => void;
    /** "stocked" updates values in batches, so you can subscribe to batch updates. */
    observeBatchUpdates: (observer: Observer<BatchUpdate<T>>) => ObserverKey;
    /** stop observing batch updates. */
    stopObservingBatchUpdates: (observerKey: ObserverKey) => void;
} & Omit<ObserversControl<T>, 'notifyAll' | 'notifySubTree'>;

/** Object, in which "stocked" calls observers */
export type BatchUpdate<T> = {
    /** which paths should be updated */
    paths: string[];
    /** all values, which should be sent to observers */
    values: T;
};

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
    const { notifySubTree, notifyAll, ...other } = useObservers();
    const batchUpdateObservers = useLazyRef<ObserverArray<BatchUpdate<T>>>(() => new ObserverArray());

    const batchUpdate = useCallback(
        (update: BatchUpdate<T>) => {
            batchUpdateObservers.current.call(update);
        },
        [batchUpdateObservers]
    );

    const setValue = useCallback(
        (path: string, action: SetStateAction<unknown>) => {
            path = normalizePath(path);

            const value = isFunction(action) ? action(getOrReturn(values.current, path)) : action;

            set(values.current, path, value);

            notifySubTree(path, values.current);

            // TODO: pass notified paths, or just remove it from BatchUpdate
            batchUpdate({ paths: [], values: values.current });
        },
        [values, batchUpdate, notifySubTree]
    );

    const setValues = useCallback(
        (newValues: T) => {
            values.current = newValues;
            notifyAll(newValues);

            // FIXME: pass notified paths, or just remove it from BatchUpdate
            batchUpdate({ paths: [], values: newValues });
        },
        [values, notifyAll, batchUpdate]
    );

    const resetValues = useCallback(() => setValues(cloneDeep(initialValues)), [initialValues, setValues]);

    const observeBatchUpdates = useCallback(
        (observer: Observer<BatchUpdate<T>>) => batchUpdateObservers.current.add(observer),
        [batchUpdateObservers]
    );

    const stopObservingBatchUpdates = useCallback((key: ObserverKey) => batchUpdateObservers.current.remove(key), [
        batchUpdateObservers,
    ]);

    return {
        values,
        setValue,
        setValues,
        resetValues,
        observeBatchUpdates,
        stopObservingBatchUpdates,
        ...other,
    };
};
