import { FunctionProxy, MappingProxy, StockProxy } from '../typings/StockProxy';
import { getOrReturn, isInnerPath } from './pathUtils';
import set from 'lodash/set';

export const getProxiedValue = <In, Out>(input: In, proxy: StockProxy<In, Out>): Out => {
    if (isMappingProxy(proxy)) {
        return Object.entries(proxy.map).reduce((acc, [to, from]) => {
            set(acc, to, getOrReturn(input, from));
            return acc;
        }, {}) as Out;
    } else {
        return proxy.get(input);
    }
};

export const setProxiedValue = <In, Out>(
    value: unknown,
    path: string,
    setInnerValue: (name: string, value: unknown) => void,
    proxy: StockProxy<In, Out>
): void => {
    if (isMappingProxy(proxy)) {
        Object.entries(proxy.map)
            .filter(([to]) => isInnerPath(path, to))
            .forEach(([to, from]) => {
                setInnerValue(from, getOrReturn(value, to.substring(path.length + 1)));
            });
    } else {
        proxy.set(value, path, setInnerValue);
    }
};

export const isMappingProxy = <In, Out>(proxy: StockProxy<In, Out>): proxy is MappingProxy =>
    (proxy as FunctionProxy<In, Out>).get === undefined;
