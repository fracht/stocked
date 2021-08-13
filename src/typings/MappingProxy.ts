import isNil from 'lodash/isNil';
import invariant from 'tiny-invariant';

import { Observer } from './Observer';
import { StockProxy } from './StockProxy';
import { ROOT_PATH } from '../hooks';
import {
    getOrReturn,
    isInnerPath,
    joinPaths,
    longestCommonPath,
    normalizePath,
    relativePath,
    setOrReturn,
} from '../utils/pathUtils';

/**
 * Simple example of StockProxy.
 * Proxies values by map. Map is built by this method:
 * {
 *      "<relative path to variable, inside proxied value>": "<path to real value, in stock>"
 * }
 */
export class MappingProxy extends StockProxy {
    private readonly map: Partial<Record<string | typeof ROOT_PATH, string>>;

    public constructor(map: Record<string, string>, path: string | typeof ROOT_PATH) {
        super(path);
        this.map = Object.entries(map).reduce<Partial<Record<string | typeof ROOT_PATH, string>>>(
            (acc, [key, value]) => {
                acc[key] = normalizePath(value);
                return acc;
            },
            {}
        );
    }

    public setValue = (
        path: string | typeof ROOT_PATH,
        value: unknown,
        defaultSetValue: (path: string | typeof ROOT_PATH, value: unknown) => void
    ) => {
        path = relativePath(this.path, path);

        const innerPaths = Object.entries(this.map).filter(([to]) => isInnerPath(path, to) || path === to);

        innerPaths
            .sort((a, b) => a.length - b.length)
            .forEach(
                ([to, from]) => from !== undefined && defaultSetValue(from, getOrReturn(value, relativePath(path, to)))
            );
    };

    public watch = <V>(
        path: string | typeof ROOT_PATH,
        observer: Observer<V>,
        defaultWatch: (path: string | typeof ROOT_PATH, observer: Observer<V>) => () => void
    ) => {
        const proxiedPath = this.getNormalPath(path);
        return defaultWatch(proxiedPath!, value => observer(this.mapValue(value, path, proxiedPath!) as V));
    };

    public getValue = <V>(
        path: string | typeof ROOT_PATH,
        defaultGetValue: <U>(path: string | typeof ROOT_PATH) => U
    ): V => {
        const proxiedPath = this.getNormalPath(path);
        return this.mapValue(defaultGetValue(proxiedPath!), path, proxiedPath!) as V;
    };

    private mapValue = (
        value: unknown,
        path: string | typeof ROOT_PATH,
        proxiedPath: string | typeof ROOT_PATH
    ): unknown => {
        path = relativePath(this.path, path);
        const innerPaths = Object.entries(this.map).filter(([to]) => isInnerPath(path, to) || path === to);
        return innerPaths.reduce<unknown>(
            (acc, [to, from]) =>
                setOrReturn(
                    acc as object,
                    relativePath(path, to),
                    getOrReturn(value, relativePath(proxiedPath, from!))
                ),
            {}
        );
    };

    public getProxiedPath = (path: string | typeof ROOT_PATH): string | typeof ROOT_PATH => {
        const proxiedPath = normalizePath(path as string);

        const normalPath = Object.entries(this.map).find(([, from]) => from === proxiedPath)?.[0];

        invariant(
            !isNil(normalPath),
            'Mapping proxy error: trying to get normal path of proxied path, which is not defined in proxy map'
        );

        return joinPaths(this.path, normalPath);
    };

    public getNormalPath = (path: string | typeof ROOT_PATH): string | typeof ROOT_PATH => {
        const normalPath = relativePath(this.path, path);

        const isIndependent = normalPath in this.map;

        invariant(
            isIndependent ||
                Object.keys(this.map).findIndex(proxiedPath => isInnerPath(normalPath, proxiedPath)) !== -1,
            'Mapping proxy error: trying to proxy value, which is not defined in proxy map.'
        );

        return isIndependent
            ? this.map[normalPath]!
            : longestCommonPath(
                  Object.entries(this.map)
                      .filter(([to]) => isInnerPath(normalPath, to))
                      .map(([, from]) => from!)
              );
    };
}
