import { MutableRefObject, useCallback, useRef } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import set from 'lodash/set';
import isFunction from 'lodash/isFunction';
import invariant from 'tiny-invariant';

import { isInnerPath, normalizePath } from '../utils/pathUtils';
import { useLazyRef } from '../utils/useLazyRef';
import { Observer } from '../typings/Observer';
import { SetStateAction } from '../typings/SetStateAction';
import { ObserverArray, ObserverKey } from '../utils/ObserverArray';

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
    /** Register function, which will be called every time value was changed. */
    observe: <V>(path: string, observer: Observer<V>) => ObserverKey;
    /** Unregister observing function. */
    stopObserving: (path: string, observerKey: ObserverKey) => void;
    /** Function for setting value. Deeply sets value, using path to variable. @see https://lodash.com/docs/4.17.15#set */
    setValue: (path: string, value: unknown) => void;
    /** Function for setting all values. */
    setValues: (values: T) => void;
    /** Function for resetting values to initial state */
    resetValues: () => void;
    /** Check if value is observed or not. */
    isObserved: (path: string) => boolean;
    /** "stocked" updates values in batches, so you can subscribe to batch updates. */
    observeBatchUpdates: (observer: Observer<BatchUpdate<T>>) => ObserverKey;
    /** stop observing batch updates. */
    stopObservingBatchUpdates: (observerKey: ObserverKey) => void;
};

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
    const observers = useRef<Record<string, ObserverArray<unknown>>>({});
    const batchUpdateObservers = useLazyRef<ObserverArray<BatchUpdate<T>>>(() => new ObserverArray());

    const observe = useCallback(<V>(path: string, observer: Observer<V>) => {
        path = normalizePath(path);
        if (!Object.prototype.hasOwnProperty.call(observers.current, path)) {
            observers.current[path] = new ObserverArray();
        }
        return observers.current[path].add(observer as Observer<unknown>);
    }, []);

    const stopObserving = useCallback((path: string, observerKey: ObserverKey) => {
        path = normalizePath(path);
        const currentObservers = observers.current[path];

        invariant(currentObservers, 'Cannot remove observer from value, which is not observing');

        currentObservers.remove(observerKey);

        if (currentObservers.isEmpty()) delete observers.current[path];
    }, []);

    const batchUpdate = useCallback(
        (update: BatchUpdate<T>) => {
            batchUpdateObservers.current.call(update);
            const { paths, values } = update;
            paths.forEach(path => {
                const observer = observers.current[path];
                const value = get(values, path);
                observer.call(value);
            });
        },
        [batchUpdateObservers]
    );

    const setValue = useCallback(
        (path: string, action: SetStateAction<unknown>) => {
            path = normalizePath(path);

            const paths = Object.keys(observers.current).filter(
                tempPath => isInnerPath(path, tempPath) || path === tempPath || isInnerPath(tempPath, path)
            );

            const value = isFunction(action) ? action(get(values.current, path)) : action;

            set(values.current, path, value);

            batchUpdate({ paths, values: values.current });
        },
        [values, batchUpdate]
    );

    const setValues = useCallback(
        (newValues: T) => {
            values.current = newValues;
            batchUpdate({ paths: Object.keys(observers.current), values: newValues });
        },
        [values, batchUpdate]
    );

    const resetValues = useCallback(() => setValues(cloneDeep(initialValues)), [initialValues, setValues]);

    const isObserved = useCallback(
        (path: string) => Object.prototype.hasOwnProperty.call(observers.current, normalizePath(path)),
        []
    );

    const observeBatchUpdates = useCallback(
        (observer: Observer<BatchUpdate<T>>) => batchUpdateObservers.current.add(observer),
        [batchUpdateObservers]
    );

    const stopObservingBatchUpdates = useCallback((key: ObserverKey) => batchUpdateObservers.current.remove(key), [
        batchUpdateObservers,
    ]);

    return {
        values,
        observe,
        stopObserving,
        setValue,
        setValues,
        resetValues,
        isObserved,
        observeBatchUpdates,
        stopObservingBatchUpdates,
    };
};
