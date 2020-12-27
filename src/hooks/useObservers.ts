import { useCallback, useRef } from 'react';
import invariant from 'tiny-invariant';
import { Observer } from '../typings';
import { ObserverArray, ObserverKey } from '../utils/ObserverArray';
import { getOrReturn, isInnerPath, normalizePath } from '../utils/pathUtils';

export type ObserversControl<T> = {
    /** Register function, which will be called every time value was changed. */
    observe: <V>(path: string, observer: Observer<V>) => ObserverKey;
    /** Unregister observing function. */
    stopObserving: (path: string, observerKey: ObserverKey) => void;
    /** Check if value is observed or not. */
    isObserved: (path: string) => boolean;
    /** Notify all observers, which are children of specified path */
    notifySubTree: (path: string, values: T) => void;
    /** Notify all observers */
    notifyAll: (values: T) => void;
};

export const useObservers = <T>(): ObserversControl<T> => {
    const observers = useRef<Record<string, ObserverArray<unknown>>>({});

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

    const isObserved = useCallback(
        (path: string) => Object.prototype.hasOwnProperty.call(observers.current, normalizePath(path)),
        []
    );

    const notifyPaths = useCallback(
        (paths: string[], values: T) =>
            paths.forEach(path => {
                const observer = observers.current[path];
                const subValue = getOrReturn(values, path);
                observer.call(subValue);
            }),
        []
    );

    const notifySubTree = useCallback(
        (path: string, values: T) => {
            path = normalizePath(path);
            const subPaths = Object.keys(observers.current).filter(
                tempPath => isInnerPath(path, tempPath) || path === tempPath || isInnerPath(tempPath, path)
            );
            notifyPaths(subPaths, values);
        },
        [notifyPaths]
    );

    const notifyAll = useCallback((values: T) => notifyPaths(Object.keys(observers.current), values), [notifyPaths]);

    return {
        observe,
        stopObserving,
        isObserved,
        notifySubTree,
        notifyAll,
    };
};
