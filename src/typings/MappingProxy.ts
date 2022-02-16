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
        const relativeValuePath = relativePath(this.path, path);

        const stringifiedPath = pxthToString(relativeValuePath);

        if (this.hasMappedPrivatePaths(stringifiedPath)) {
            const normalPath = this.getNormalPath(path);
            defaultSetValue(normalPath, value);
            return;
        }

        const innerPaths = Object.entries(this.map).filter(
            ([to]) => isInnerPath(stringifiedPath, to) || stringifiedPath === to
        );

        innerPaths.forEach(
            ([to, from]) =>
                from !== undefined &&
                defaultSetValue(
                    from,
                    deepGet(value, relativePath(relativeValuePath, createPxth(parseSegmentsFromString(to))))
                )
        );
    };

    public watch = <V>(
        path: Pxth<V>,
        observer: Observer<V>,
        defaultWatch: <U>(path: Pxth<U>, observer: Observer<U>) => () => void
    ) => {
        const normalPath = this.getNormalPath(path);
        return defaultWatch(normalPath, value => observer(this.mapValue(value, path, normalPath!) as V));
    };

    public getValue = <V>(path: Pxth<V>, defaultGetValue: <U>(path: Pxth<U>) => U): V => {
        const normalPath = this.getNormalPath(path);
        return this.mapValue(defaultGetValue(normalPath), path, normalPath!) as V;
    };

    private mapValue = <V>(value: V, path: Pxth<V>, normalPath: Pxth<V>): V => {
        path = relativePath(this.path, path);

        const stringifiedPath = pxthToString(path);

        if (this.hasMappedPrivatePaths(stringifiedPath)) {
            return value;
        }

        const innerPaths = Object.entries(this.map).filter(
            ([to]) => isInnerPath(stringifiedPath, to) || stringifiedPath === to
        );

        return innerPaths.reduce<V>(
            (acc, [to, from]) =>
                deepSet(
                    (acc as unknown) as object,
                    relativePath(path, createPxth(parseSegmentsFromString(to))),
                    deepGet(value, relativePath(normalPath, from!))
                ) as V,
            {} as V
        );
    };

    private hasMappedPrivatePaths = (stringifiedPath: string | RootPath) =>
        Object.keys(this.map).some(mappedPath => isInnerPath(mappedPath, stringifiedPath));

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
        const hasMappedChildrenPaths = Object.keys(this.map).some(mappedPath =>
            isInnerPath(stringifiedPath, mappedPath)
        );
        const hasMappedParentPaths = this.hasMappedPrivatePaths(stringifiedPath);

        if (isIndependent) {
            return this.map[stringifiedPath]! as Pxth<V>;
        }

        if (hasMappedChildrenPaths) {
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

        if (hasMappedParentPaths) {
            const [to, from] = Object.entries(this.map).find(([mappedPath]) =>
                isInnerPath(mappedPath, stringifiedPath)
            )!;

            const pxthTo = createPxth(parseSegmentsFromString(to));
            const pxthFrom = from!;

            return joinPaths<V>(pxthFrom, relativePath(pxthTo, normalPath as Pxth<unknown>));
        }

        invariant(false, 'Mapping proxy error: trying to proxy value, which is not defined in proxy map.');
    };
}
