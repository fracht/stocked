import isNil from 'lodash/isNil';
import { createPxth, deepGet, deepSet, parseSegmentsFromString, Pxth, pxthToString, RootPath } from 'pxth';
import invariant from 'tiny-invariant';

import { Observer } from './Observer';
import { StockProxy } from './StockProxy';
import { isInnerPath, joinPaths, longestCommonPath, relativePath } from '../utils/pathUtils';

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
                    from !== undefined &&
                    defaultSetValue(from, deepGet(value, relativePath(path, createPxth(parseSegmentsFromString(to)))))
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
                    relativePath(path, createPxth(parseSegmentsFromString(to))),
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

        return joinPaths<V>(this.path as Pxth<unknown>, createPxth(parseSegmentsFromString(normalPath)));
    };

    public getNormalPath = <V>(path: Pxth<V>): Pxth<V> => {
        const normalPath = relativePath(this.path, path);
        const stringifiedPath = pxthToString(normalPath);

        const isIndependent = stringifiedPath in this.map;
        const existsChildPath = Object.keys(this.map).some(mappedPath => isInnerPath(stringifiedPath, mappedPath));
        const existsParentPath = Object.keys(this.map).some(mappedPath => isInnerPath(mappedPath, stringifiedPath));

        invariant(
            isIndependent || existsChildPath || existsParentPath,
            'Mapping proxy error: trying to proxy value, which is not defined in proxy map.'
        );

        if (isIndependent) {
            return this.map[stringifiedPath]! as Pxth<V>;
        }

        if (existsChildPath) {
            return createPxth(
                parseSegmentsFromString(
                    longestCommonPath(
                        Object.entries(this.map)
                            .filter(([to]) => isInnerPath(stringifiedPath, to))
                            .map(([, from]) => pxthToString(from!) as string)
                    )
                )
            );
        }

        const [to, from] = Object.entries(this.map).find(([mappedPath]) => isInnerPath(mappedPath, stringifiedPath))!;

        const pxthTo = createPxth(parseSegmentsFromString(to));
        const pxthFrom = from!;

        return joinPaths<V>(pxthFrom, relativePath(pxthTo, normalPath as Pxth<unknown>));
    };
}
