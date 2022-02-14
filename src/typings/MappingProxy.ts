import isNil from 'lodash/isNil';
import { deepGet, deepSet, Pxth, pxthToString, RootPath } from 'pxth';
import invariant from 'tiny-invariant';

import { Observer } from './Observer';
import { StockProxy } from './StockProxy';
import { isInnerPath, joinPaths, longestCommonPath, relativePath, stringToPxth } from '../utils/pathUtils';

/**
 * Simple example of StockProxy.
 * Proxies values by map. Map is built by this method:
 * {
 *      "<relative path to variable, inside proxied value>": "<path to real value, in stock>"
 * }
 */
export class MappingProxy<T> extends StockProxy<T> {
    private readonly map: Partial<Record<string | RootPath, Pxth<unknown>>>;

    public constructor(map: Partial<Record<string | RootPath, Pxth<unknown>>>, path: Pxth<T>) {
        super(path);
        this.map = map;
    }

    public setValue = <V>(path: Pxth<V>, value: V, defaultSetValue: <U>(path: Pxth<U>, value: U) => void) => {
        path = relativePath(this.path, path);

        const stringifiedPath = pxthToString(path);

        const innerPaths = Object.entries(this.map).filter(
            ([to]) => isInnerPath(stringifiedPath, to) || stringifiedPath === to
        );

        innerPaths
            .sort((a, b) => a.length - b.length)
            .forEach(
                ([to, from]) =>
                    from !== undefined && defaultSetValue(from, deepGet(value, relativePath(path, stringToPxth(to))))
            );
    };

    public watch = <V>(
        path: Pxth<V>,
        observer: Observer<V>,
        defaultWatch: <U>(path: Pxth<U>, observer: Observer<U>) => () => void
    ) => {
        const proxiedPath = this.getNormalPath(path);
        return defaultWatch(proxiedPath, value => observer(this.mapValue(value, path, proxiedPath!) as V));
    };

    public getValue = <V>(path: Pxth<V>, defaultGetValue: <U>(path: Pxth<U>) => U): V => {
        const proxiedPath = this.getNormalPath(path);
        return this.mapValue(defaultGetValue(proxiedPath), path, proxiedPath!) as V;
    };

    private mapValue = <V>(value: V, path: Pxth<V>, proxiedPath: Pxth<V>): V => {
        path = relativePath(this.path, path);

        const stringifiedPath = pxthToString(path);

        const innerPaths = Object.entries(this.map).filter(
            ([to]) => isInnerPath(stringifiedPath, to) || stringifiedPath === to
        );
        return innerPaths.reduce<V>(
            (acc, [to, from]) =>
                deepSet(
                    (acc as unknown) as object,
                    relativePath(path, stringToPxth(to)),
                    deepGet(value, relativePath(proxiedPath, from!))
                ) as V,
            {} as V
        );
    };

    public getProxiedPath = <V>(path: Pxth<V>): Pxth<V> => {
        const proxiedPath = pxthToString(path);

        const normalPath = Object.entries(this.map).find(([, from]) => pxthToString(from!) === proxiedPath)?.[0];

        invariant(
            !isNil(normalPath),
            'Mapping proxy error: trying to get normal path of proxied path, which is not defined in proxy map'
        );

        return stringToPxth(joinPaths(pxthToString(this.path), normalPath));
    };

    public getNormalPath = <V>(path: Pxth<V>): Pxth<V> => {
        const normalPath = relativePath(this.path, path);
        const stringifiedPath = pxthToString(normalPath);

        const isIndependent = pxthToString(normalPath) in this.map;
        const isComposite = Object.keys(this.map).some(mappedPath => isInnerPath(stringifiedPath, mappedPath));
        const isChild = Object.keys(this.map).some(mappedPath => isInnerPath(mappedPath, stringifiedPath));

        invariant(
            isIndependent || isComposite || isChild,
            'Mapping proxy error: trying to proxy value, which is not defined in proxy map.'
        );

        if (isIndependent) {
            return this.map[stringifiedPath]! as Pxth<V>;
        }

        if (isComposite) {
            return stringToPxth(
                longestCommonPath(
                    Object.entries(this.map)
                        .filter(([to]) => isInnerPath(stringifiedPath, to))
                        .map(([, from]) => pxthToString(from!) as string)
                )
            );
        }

        const [to, from] = Object.entries(this.map).find(([mappedPath]) => isInnerPath(mappedPath, stringifiedPath))!;

        return stringToPxth(joinPaths(pxthToString(from!), pxthToString(relativePath(stringToPxth(to), normalPath))));
    };
}
