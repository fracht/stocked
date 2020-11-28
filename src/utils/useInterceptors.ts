import { useCallback, useRef } from 'react';
import invariant from 'tiny-invariant';
import { ProxyContextType } from '../components/ProxyContext';
import { Stock } from '../hooks/useStock';
import { Observer } from '../typings/Observer';
import { StockProxy } from '../typings/StockProxy';
import { ObserverArray, ObserverKey } from './ObserverArray';
import { findDeepestParent, getOrReturn, normalizePath } from './pathUtils';
import { getProxiedValue } from './proxyUtils';

const findProxyName = (name: string, proxies: Record<string, StockProxy<unknown, unknown>>) =>
    findDeepestParent(name, Object.keys(proxies));

export const useInterceptors = <T extends object>(stock: Stock<T>, { proxies }: ProxyContextType): Stock<T> => {
    const observersSubTree = useRef<Record<string, Record<string, ObserverArray<unknown>>>>({});
    const proxyObservers = useRef<Record<string, ObserverKey>>({});

    const { observe, stopObserving } = stock;

    const interceptedObservation = useCallback(
        <V>(name: string, observer: Observer<V>): ObserverKey => {
            const proxyName = findProxyName(name, proxies);
            if (proxyName !== undefined) {
                if (!Object.prototype.hasOwnProperty.call(proxyObservers.current, proxyName)) {
                    proxyObservers.current[proxyName] = observe(proxyName, (message: V) => {
                        const proxiedMessage = getProxiedValue(message, proxies[proxyName]);
                        Object.entries(observersSubTree.current[proxyName]).forEach(([key, arr]) =>
                            arr.call(getOrReturn(proxiedMessage, key.substring(proxyName.length + 1)))
                        );
                    });
                }

                return observersSubTree.current[proxyName][normalizePath(name)].add(observer as Observer<unknown>);
            } else {
                return observe(name, observer);
            }
        },
        [observe, proxies]
    );

    const interceptedStopObservation = useCallback(
        (name: string, key: ObserverKey) => {
            const proxyName = findProxyName(name, proxies);
            if (proxyName !== undefined) {
                name = normalizePath(name);
                invariant(
                    Object.prototype.hasOwnProperty.call(observersSubTree.current, proxyName) &&
                        Object.prototype.hasOwnProperty.call(observersSubTree.current[proxyName], name),
                    'Trying to remove observer, which not exists (interceptedStopObservation in proxy)'
                );

                observersSubTree.current[proxyName][name].remove(key);
                if (observersSubTree.current[proxyName][name].isEmpty()) {
                    delete observersSubTree.current[proxyName][name];
                    if (Object.keys(observersSubTree.current[proxyName]).length === 0) {
                        delete observersSubTree.current[proxyName];
                        stopObserving(proxyName, proxyObservers.current[proxyName]);
                        delete proxyObservers.current[proxyName];
                    }
                }
            } else {
                return stopObserving(name, key);
            }
        },
        [proxies, stopObserving]
    );

    return {
        ...stock,
        observe: interceptedObservation,
        stopObserving: interceptedStopObservation,
    };
};
