import { useCallback, useRef } from 'react';
import invariant from 'tiny-invariant';
import { BatchUpdate, Observer } from '../typings';
import { ObserverArray, ObserverKey } from '../utils/ObserverArray';
import { getOrReturn, isInnerPath, normalizePath } from '../utils/pathUtils';
import { useLazyRef } from '../utils/useLazyRef';

export const ROOT_PATH = Symbol();

export type ObserversControl<T> = {
    /** Watch stock value. Returns cleanup function. */
    watch: <V>(path: string | typeof ROOT_PATH, observer: Observer<V>) => () => void;
    /** Watch all stock values. Returns cleanup function. */
    watchAll: (observer: Observer<T>) => () => void;
    /** Check if value is observed or not. */
    isObserved: (path: string) => boolean;
    /** Notify all observers, which are children of specified path */
    notifySubTree: (path: string, values: T) => void;
    /** Notify all observers */
    notifyAll: (values: T) => void;
    /** "stocked" updates values in batches, so you can subscribe to batch updates. Returns cleanup. */
    watchBatchUpdates: (observer: Observer<BatchUpdate<T>>) => () => void;
};

/** Hook, wraps functionality of observers storage (add, remove, notify tree of observers, etc.) */
export const useObservers = <T>(): ObserversControl<T> => {
    const observers = useRef<Record<string, ObserverArray<unknown>>>({});
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

    const observe = useCallback(<V>(path: string | typeof ROOT_PATH, observer: Observer<V>) => {
        path = normalizePath(path as string);
        if (!Object.prototype.hasOwnProperty.call(observers.current, path)) {
            observers.current[path] = new ObserverArray();
        }
        return observers.current[path].add(observer as Observer<unknown>);
    }, []);

    const stopObserving = useCallback((path: string | typeof ROOT_PATH, observerKey: ObserverKey) => {
        path = normalizePath(path as string);
        const currentObservers = observers.current[path];

        invariant(currentObservers, 'Cannot remove observer from value, which is not observing');

        currentObservers.remove(observerKey);

        if (currentObservers.isEmpty()) delete observers.current[path];
    }, []);

    const watch = useCallback(
        <V>(path: string | typeof ROOT_PATH, observer: Observer<V>) => {
            const key = observe(path, observer);
            return () => stopObserving(path, key);
        },
        [observe, stopObserving]
    );

    const watchAll = useCallback((observer: Observer<T>) => watch((ROOT_PATH as unknown) as string, observer), [watch]);

    const watchBatchUpdates = useCallback(
        (observer: Observer<BatchUpdate<T>>) => {
            const key = observeBatchUpdates(observer);
            return () => stopObservingBatchUpdates(key);
        },
        [observeBatchUpdates, stopObservingBatchUpdates]
    );

    const isObserved = useCallback(
        (path: string) => Object.prototype.hasOwnProperty.call(observers.current, normalizePath(path)),
        []
    );

    const notifyPaths = useCallback(
        (paths: string[], values: T) => {
            batchUpdate({ paths, values });
            paths.forEach(path => {
                const observer = observers.current[path];
                const subValue = getOrReturn(values, path);
                observer.call(subValue);
            });
        },
        [batchUpdate]
    );

    const notifySubTree = useCallback(
        (path: string, values: T) => {
            path = normalizePath(path);
            const subPaths = getObserversKeys().filter(
                tempPath => isInnerPath(path, tempPath) || path === tempPath || isInnerPath(tempPath, path)
            );
            notifyPaths(subPaths, values);
        },
        [notifyPaths, getObserversKeys]
    );

    const notifyAll = useCallback((values: T) => notifyPaths(getObserversKeys(), values), [
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
