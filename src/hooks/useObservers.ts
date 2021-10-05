import { useCallback, useRef } from 'react';
import { createPxth, deepGet, parseSegmentsFromString, Pxth, pxthToString, RootPath } from 'pxth';
import invariant from 'tiny-invariant';

import { BatchUpdate, Observer } from '../typings';
import { ObserverArray, ObserverKey } from '../utils/ObserverArray';
import { isInnerPath } from '../utils/pathUtils';
import { useLazyRef } from '../utils/useLazyRef';

export type ObserversControl<T> = {
    /** Watch stock value. Returns cleanup function. */
    watch: <V>(path: Pxth<V>, observer: Observer<V>) => () => void;
    /** Watch all stock values. Returns cleanup function. */
    watchAll: (observer: Observer<T>) => () => void;
    /** Check if value is observed or not. */
    isObserved: <V>(path: Pxth<V>) => boolean;
    /** Notify all observers, which are children of specified path */
    notifySubTree: <V>(path: Pxth<V>, values: T) => void;
    /** Notify all observers */
    notifyAll: (values: T) => void;
    /** "stocked" updates values in batches, so you can subscribe to batch updates. Returns cleanup. */
    watchBatchUpdates: (observer: Observer<BatchUpdate<T>>) => () => void;
};

/** Hook, wraps functionality of observers storage (add, remove, notify tree of observers, etc.) */
export const useObservers = <T>(): ObserversControl<T> => {
    const observers = useRef<Record<string | RootPath, ObserverArray<unknown>>>(
        {} as Record<string | RootPath, ObserverArray<unknown>>
    );
    const batchUpdateObservers = useLazyRef<ObserverArray<BatchUpdate<T>>>(() => new ObserverArray());

    const getObserversKeys = useCallback(
        () => [
            ...Object.keys(observers.current),
            ...((Object.getOwnPropertySymbols(observers.current) as unknown) as string[]),
        ],
        []
    );

    const batchUpdate = useCallback(
        (update: BatchUpdate<T>) => {
            batchUpdateObservers.current.call(update);
        },
        [batchUpdateObservers]
    );

    const observeBatchUpdates = useCallback(
        (observer: Observer<BatchUpdate<T>>) => batchUpdateObservers.current.add(observer),
        [batchUpdateObservers]
    );

    const stopObservingBatchUpdates = useCallback((key: ObserverKey) => batchUpdateObservers.current.remove(key), [
        batchUpdateObservers,
    ]);

    const observe = useCallback(<V>(path: Pxth<V>, observer: Observer<V>) => {
        const pathKey = pxthToString(path);

        if (!Object.prototype.hasOwnProperty.call(observers.current, pathKey)) {
            observers.current[pathKey] = new ObserverArray();
        }

        return observers.current[pathKey].add(observer as Observer<unknown>);
    }, []);

    const stopObserving = useCallback(<V>(path: Pxth<V>, observerKey: ObserverKey) => {
        const pathKey = pxthToString(path);

        const currentObservers = observers.current[pathKey];

        invariant(currentObservers, 'Cannot remove observer from value, which is not observing');

        currentObservers.remove(observerKey);

        if (currentObservers.isEmpty()) delete observers.current[pathKey];
    }, []);

    const watch = useCallback(
        <V>(path: Pxth<V>, observer: Observer<V>) => {
            const key = observe(path, observer);
            return () => stopObserving(path, key);
        },
        [observe, stopObserving]
    );

    const watchAll = useCallback((observer: Observer<T>) => watch(createPxth<T>([]), observer), [watch]);

    const watchBatchUpdates = useCallback(
        (observer: Observer<BatchUpdate<T>>) => {
            const key = observeBatchUpdates(observer);

            return () => stopObservingBatchUpdates(key);
        },
        [observeBatchUpdates, stopObservingBatchUpdates]
    );

    const isObserved = useCallback(
        <V>(path: Pxth<V>) => Object.prototype.hasOwnProperty.call(observers.current, pxthToString(path)),
        []
    );

    const notifyPaths = useCallback(
        (origin: Pxth<unknown>, paths: string[], values: T) => {
            batchUpdate({ paths, origin, values });
            paths.forEach(path => {
                const observer = observers.current[path];
                const subValue = deepGet(values, createPxth(parseSegmentsFromString(path)));
                observer.call(subValue);
            });
        },
        [batchUpdate]
    );

    const notifySubTree = useCallback(
        <V>(path: Pxth<V>, values: T) => {
            const stringifiedPath = pxthToString(path);

            const subPaths = getObserversKeys().filter(
                tempPath =>
                    isInnerPath(stringifiedPath, tempPath) ||
                    stringifiedPath === tempPath ||
                    isInnerPath(tempPath, stringifiedPath)
            );

            notifyPaths(path as Pxth<unknown>, subPaths, values);
        },
        [notifyPaths, getObserversKeys]
    );

    const notifyAll = useCallback((values: T) => notifyPaths(createPxth([]), getObserversKeys(), values), [
        notifyPaths,
        getObserversKeys,
    ]);

    return {
        watch,
        watchAll,
        watchBatchUpdates,
        isObserved,
        notifySubTree,
        notifyAll,
    };
};
