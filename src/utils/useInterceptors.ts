import { useCallback } from 'react';
import { Stock } from '../hooks/useStock';
import { Observer } from '../typings';
import { StockProxy } from '../typings/StockProxy';
import { ObserverKey } from './ObserverArray';
import { isInnerPath } from './pathUtils';

const shouldUseProxy = (proxy: StockProxy | undefined, path: string) => proxy && isInnerPath(proxy.path, path);

export const intercept = <T extends (...args: any[]) => any>(
    proxy: StockProxy | undefined,
    path: string,
    standardCallback: T,
    proxiedCallback: T,
    args: Parameters<T>
): ReturnType<T> => {
    if (!shouldUseProxy(proxy, path)) {
        return standardCallback(...args);
    } else {
        return proxiedCallback(...args);
    }
};

export const useInterceptors = <T extends object>(stock: Stock<T>, proxy?: StockProxy): Stock<T> => {
    const { observe, stopObserving, setValue } = stock;

    const interceptedObserve = useCallback(
        <V>(path: string, observer: Observer<V>) =>
            intercept(
                proxy,
                path,
                observe,
                (path, observer: Observer<V>) => proxy!.observe<V>(path, observer, observe),
                [path, observer as Observer<unknown>]
            ),
        [observe, proxy]
    );

    const interceptedStopObserving = useCallback(
        (path: string, key: ObserverKey) =>
            intercept(proxy, path, stopObserving, (path, key) => proxy!.stopObserving(path, key, stopObserving), [
                path,
                key,
            ]),
        [stopObserving, proxy]
    );

    const interceptedSetValue = useCallback(
        (path: string, value: unknown) =>
            intercept(proxy, path, setValue, (path: string, value: unknown) => proxy!.setValue(path, value, setValue), [
                path,
                value,
            ]),
        [proxy, setValue]
    );

    if (!proxy) return stock;

    return {
        ...stock,
        observe: interceptedObserve,
        stopObserving: interceptedStopObserving,
        setValue: interceptedSetValue,
    };
};
