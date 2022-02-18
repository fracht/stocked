import isNil from 'lodash/isNil';
import { createPxth, deepGet, deepSet, parseSegmentsFromString, Pxth, pxthToString } from 'pxth';
import invariant from 'tiny-invariant';

import { Observer } from './Observer';
import { ProxyMap } from './ProxyMap';
import { StockProxy } from './StockProxy';
import { ProxyMapSource } from '.';
import { createProxyMap } from '../utils/createProxyMap';
import { getInnerPaths, hasMappedParentPaths } from '../utils/mappingProxyUtils';
import { isInnerPath, joinPaths, longestCommonPath, relativePath } from '../utils/pathUtils';

/**
 * Simple example of StockProxy.
 * Proxies values by map. Map is built by this method:
 * {
 *      relative: {
 *          proxied: {
 *              path: "<path to real value, in stock>"
 *          },
 *      }
 * }
 */
export class MappingProxy<T> extends StockProxy<T> {
    private readonly proxyMap: ProxyMap;

    public constructor(mapSource: ProxyMapSource<T>, path: Pxth<T>) {
        super(path);
        this.proxyMap = createProxyMap(mapSource);
    }

    public setValue = <V>(path: Pxth<V>, value: V, defaultSetValue: <U>(path: Pxth<U>, value: U) => void) => {
        const relativeValuePath = relativePath(this.path, path);

        if (hasMappedParentPaths(relativeValuePath, this.proxyMap)) {
            const normalPath = this.getNormalPath(path);
            defaultSetValue(normalPath, value);
            return;
        }

        const innerPaths = getInnerPaths(relativeValuePath, this.proxyMap);

        innerPaths.forEach(
            ([to, from]) =>
                from !== undefined && defaultSetValue(from, deepGet(value, relativePath(relativeValuePath, to)))
        );
    };

    public watch = <V>(
        path: Pxth<V>,
        observer: Observer<V>,
        defaultWatch: <U>(path: Pxth<U>, observer: Observer<U>) => () => void
    ) => {
        const normalPath = this.getNormalPath(path);
        return defaultWatch(normalPath, value => observer(this.mapValue(value, path, normalPath) as V));
    };

    public getValue = <V>(path: Pxth<V>, defaultGetValue: <U>(path: Pxth<U>) => U): V => {
        const normalPath = this.getNormalPath(path);
        return this.mapValue(defaultGetValue(normalPath), path, normalPath) as V;
    };

    private mapValue = <V>(value: V, path: Pxth<V>, normalPath: Pxth<V>): V => {
        path = relativePath(this.path, path);

        if (hasMappedParentPaths(path, this.proxyMap)) {
            return value;
        }

        const innerPaths = getInnerPaths(path, this.proxyMap);

        return innerPaths.reduce<V>(
            (acc, [to, from]) =>
                deepSet(
                    acc as unknown as object,
                    relativePath(path, to),
                    deepGet(value, relativePath(normalPath, from!))
                ) as V,
            {} as V
        );
    };

    public getProxiedPath = <V>(path: Pxth<V>): Pxth<V> => {
        const proxiedPath = pxthToString(path);

        const normalPath = this.proxyMap.entries().find(([, from]) => pxthToString(from!) === proxiedPath)?.[0];

        invariant(
            !isNil(normalPath),
            'Mapping proxy error: trying to get normal path of proxied path, which is not defined in proxy map'
        );

        return joinPaths<V>(this.path as Pxth<unknown>, normalPath);
    };

    public getNormalPath = <V>(path: Pxth<V>): Pxth<V> => {
        const normalPath = relativePath(this.path, path);
        const stringifiedPath = pxthToString(normalPath);

        const isIndependent = this.proxyMap.has(normalPath);

        if (isIndependent) {
            return this.proxyMap.get(normalPath) as Pxth<V>;
        }

        const hasMappedChildrenPaths = this.proxyMap
            .entries()
            .some(([mappedPath]) => isInnerPath(stringifiedPath, pxthToString(mappedPath)));

        if (hasMappedChildrenPaths) {
            return createPxth(
                parseSegmentsFromString(
                    longestCommonPath(
                        this.proxyMap
                            .entries()
                            .filter(([to]) => isInnerPath(stringifiedPath, pxthToString(to)))
                            .map(([, from]) => pxthToString(from!) as string)
                    )
                )
            );
        }

        if (hasMappedParentPaths(normalPath, this.proxyMap)) {
            const [to, from] = this.proxyMap
                .entries()
                .find(([mappedPath]) => isInnerPath(pxthToString(mappedPath), stringifiedPath))!;

            return joinPaths<V>(from!, relativePath(to, normalPath as Pxth<unknown>));
        }

        invariant(false, 'Mapping proxy error: trying to proxy value, which is not defined in proxy map.');
    };
}
