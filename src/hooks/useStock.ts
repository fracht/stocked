import { MutableRefObject, useCallback, useRef } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import set from 'lodash/set';
import clone from 'lodash/clone';
import invariant from 'tiny-invariant';

import { isInnerPath, normalizePath } from '../utils/pathUtils';
import { useLazyRef } from '../utils/useLazyRef';
import { Observer } from '../typings/Observer';
import { removeObserver, callObservers } from '../utils/observers';

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
    observe: <V>(path: string, observer: Observer<V>) => void;
    /** Unregister observing function. */
    stopObserving: <V>(path: string, observer: Observer<V>) => void;
    /** Function for setting value. Deeply sets value, using path to variable. @see https://lodash.com/docs/4.17.15#set */
    setValue: (path: string, value: unknown) => void;
    /** Function for setting all values. */
    setValues: (values: T) => void;
    /** Check if value is observed or not. */
    isObserved: (path: string) => boolean;
    /** "stocked" updates values in batches, so you can subscribe to batch updates. */
    observeBatchUpdates: (observer: Observer<BatchUpdate<T>>) => void;
    /** stop observing batch updates. */
    stopObservingBatchUpdates: (observer: Observer<BatchUpdate<T>>) => void;
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
    const observers = useRef<Record<string, Array<Observer<unknown>>>>({});
    const batchUpdateObservers = useRef<Array<Observer<BatchUpdate<T>>>>([]);

    const observe = useCallback(<V>(path: string, observer: Observer<V>) => {
        path = normalizePath(path);
        if (!Object.prototype.hasOwnProperty.call(observers.current, path)) {
            observers.current[path] = [];
        }
        observers.current[path].push(observer as Observer<unknown>);
    }, []);

    const stopObserving = useCallback(<V>(path: string, observer: Observer<V>) => {
        const currentObservers = observers.current[path];

        invariant(currentObservers, 'Cannot remove observer from value, which is not observing');

        removeObserver(currentObservers, observer);

        if (currentObservers.length === 0) delete observers.current[path];
    }, []);

    const batchUpdate = useCallback((update: BatchUpdate<T>) => {
        callObservers(batchUpdateObservers.current, update);
        const { paths, values } = update;
        paths.forEach(path => {
            const observer = observers.current[path];
            const value = get(values, path);
            callObservers(observer, typeof value === 'object' ? clone(value) : value);
        });
    }, []);

    const setValue = useCallback(
        (path: string, value: unknown) => {
            set(values.current, path, value);

            const paths = Object.keys(observers.current).filter(
                tempPath => isInnerPath(path, tempPath) || path === tempPath || isInnerPath(tempPath, path)
            );

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

    const isObserved = useCallback((path: string) => Object.prototype.hasOwnProperty.call(observers.current, path), []);

    const observeBatchUpdates = useCallback(
        (observer: Observer<BatchUpdate<T>>) => batchUpdateObservers.current.push(observer),
        []
    );

    const stopObservingBatchUpdates = useCallback(
        (observer: Observer<BatchUpdate<T>>) => removeObserver(batchUpdateObservers.current, observer),
        []
    );

    return {
        values,
        observe,
        stopObserving,
        setValue,
        isObserved,
        setValues,
        observeBatchUpdates,
        stopObservingBatchUpdates,
    };
};
