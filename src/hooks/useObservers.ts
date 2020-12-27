import { useCallback, useRef } from 'react';
import invariant from 'tiny-invariant';
import { Observer } from '../typings';
import { ObserverArray, ObserverKey } from '../utils/ObserverArray';
import { getOrReturn, isInnerPath, normalizePath, relativePath } from '../utils/pathUtils';

export type ObserversControl = {
    /** Register function, which will be called every time value was changed. */
    observe: <V>(path: string, observer: Observer<V>) => ObserverKey;
    /** Unregister observing function. */
    stopObserving: (path: string, observerKey: ObserverKey) => void;
    /** Check if value is observed or not. */
    isObserved: (path: string) => boolean;
    /** Notify all observers, which are children of specified path */
    notifySubTree: <V>(path: string, value: V) => void;
    /** Notify all observers */
    notifyAll: <V>(values: V) => void;
};

export const useObservers = (): ObserversControl => {
    const observers = useRef<Record<string, ObserverArray<unknown>>>({});

    const observe = useCallback(<V>(path: string, observer: Observer<V>) => {
        path = normalizePath(path);
        if (!Object.prototype.hasOwnProperty.call(observers.current, path)) {
            observers.current[path] = new ObserverArray();
        }
        return observers.current[path].add(observer as Observer<unknown>);
    }, []);

    const stopObserving = useCallback((path: string, observerKey: ObserverKey) => {
        const currentObservers = observers.current[path];

        invariant(currentObservers, "Cannot remove observer from value, which is'n observed");

        currentObservers.remove(observerKey);

        if (currentObservers.isEmpty()) delete observers.current[path];
    }, []);

    const isObserved = useCallback((path: string) => Object.prototype.hasOwnProperty.call(observers.current, path), []);

    const notifyPaths = useCallback(
        <V>(paths: string[], value: V, getSubValue: (value: unknown, path: string) => unknown = getOrReturn) =>
            paths.forEach(path => {
                const observer = observers.current[path];
                const subValue = getSubValue(value, path);
                observer.call(subValue);
            }),
        []
    );

    const notifySubTree = useCallback(
        <V>(path: string, value: V) => {
            const subPaths = Object.keys(observers.current).filter(
                tempPath => isInnerPath(path, tempPath) || path === tempPath || isInnerPath(tempPath, path)
            );
            notifyPaths(subPaths, value, (value, subPath) => getOrReturn(value, relativePath(path, subPath)));
        },
        [notifyPaths]
    );

    const notifyAll = useCallback(<V>(values: V) => notifyPaths(Object.keys(observers.current), values), [notifyPaths]);

    return {
        observe,
        stopObserving,
        isObserved,
        notifySubTree,
        notifyAll,
    };
};
