import { useCallback, useEffect } from 'react';
import invariant from 'tiny-invariant';
import { ROOT_PATH } from '../hooks';
import { Stock } from '../hooks/useStock';
import { Observer } from '../typings';
import { StockProxy } from '../typings/StockProxy';
import { isInnerPath, normalizePath } from './pathUtils';

const shouldUseProxy = (proxy: StockProxy | undefined, path: string | typeof ROOT_PATH) =>
    proxy &&
    (isInnerPath(proxy.path, path) ||
        normalizePath(proxy.path as string).trim?.() === normalizePath(path as string).trim?.());

/**
 * Helper function. Calls `standardCallback` if `proxy` is undefined, or if `path` isn't inner path of `proxy.path` variable.
 * Otherwise, calls `proxiedCallback`.
 * Passes args into function.
 */
export const intercept = <T extends (...args: any[]) => any>(
    proxy: StockProxy | undefined,
    path: string | typeof ROOT_PATH,
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

/** Intercepts stock's `observe`, `stopObserving` and `setValue` functions, if proxy is provided. */
export const useInterceptors = <T extends object>(stock: Stock<T>, proxy?: StockProxy): Stock<T> => {
    const { watch, setValue, getValue } = stock;

    useEffect(
        () =>
            invariant(
                !proxy || proxy.isActive(),
                'Cannot use not activated proxy. Maybe you forgot to call proxy.activate()?'
            ),
        [proxy]
    );

    const interceptedWatch = useCallback(
        <V>(path: string | typeof ROOT_PATH, observer: Observer<V>) =>
            intercept(
                proxy,
                path,
                watch,
                (path: string | typeof ROOT_PATH, observer: Observer<V>) => proxy!.watch<V>(path, observer, watch),
                [path, observer]
            ),
        [watch, proxy]
    );

    const interceptedSetValue = useCallback(
        (path: string | typeof ROOT_PATH, value: unknown) =>
            intercept(
                proxy,
                path,
                setValue,
                (path: string | typeof ROOT_PATH, value: unknown) => proxy!.setValue(path, value, setValue),
                [path, value]
            ),
        [proxy, setValue]
    );

    const interceptedGetValue = useCallback(
        <V>(path: string | typeof ROOT_PATH) =>
            intercept(proxy, path, getValue, (path: string | typeof ROOT_PATH) => proxy!.getValue<V>(path, getValue), [
                path,
            ]),
        [proxy, getValue]
    );

    if (!proxy) return stock;

    return {
        ...stock,
        watch: interceptedWatch,
        setValue: interceptedSetValue,
        getValue: interceptedGetValue,
    };
};
