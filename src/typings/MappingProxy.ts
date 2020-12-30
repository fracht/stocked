import invariant from 'tiny-invariant';
import {
    getOrReturn,
    isInnerPath,
    longestCommonPath,
    normalizePath,
    relativePath,
    setOrReturn,
} from '../utils/pathUtils';
import { Observer } from './Observer';
import { StockProxy } from './StockProxy';

/**
 * Simple example of StockProxy.
 * Proxies values by map. Map is built by this method:
 * {
 *      "<relative path to variable, inside proxied value>": "<path to real value, in stock>"
 * }
 */
export class MappingProxy extends StockProxy {
    private readonly map: Record<string, string>;

    public constructor(map: Record<string, string>, path: string) {
        super(path);
        this.map = Object.entries(map).reduce<Record<string, string>>((acc, [key, value]) => {
            acc[key] = normalizePath(value);
            return acc;
        }, {});
    }

    public setValue = (path: string, value: unknown, defaultSetValue: (path: string, value: unknown) => void) => {
        path = relativePath(this.path, path);

        const innerPaths = Object.entries(this.map).filter(([to]) => isInnerPath(path, to) || path === to);

        innerPaths
            .sort((a, b) => a.length - b.length)
            .forEach(([to, from]) => defaultSetValue(from, getOrReturn(value, relativePath(path, to))));
    };

    public watch = <V>(
        path: string,
        observer: Observer<V>,
        defaultWatch: (path: string, observer: Observer<V>) => () => void
    ) => {
        const proxiedPath = this.getProxiedPath(path);
        return defaultWatch(proxiedPath, value => observer(this.mapValue(value, path, proxiedPath) as V));
    };

    public getValue = <V>(path: string, defaultGetValue: <U>(path: string) => U): V => {
        const proxiedPath = this.getProxiedPath(path);
        return this.mapValue(defaultGetValue(proxiedPath), path, proxiedPath) as V;
    };

    private mapValue = (value: unknown, path: string, proxiedPath: string): unknown => {
        path = relativePath(this.path, path);
        const innerPaths = Object.entries(this.map).filter(([to]) => isInnerPath(path, to) || path === to);
        return innerPaths.reduce<unknown>(
            (acc, [to, from]) =>
                setOrReturn(acc as object, relativePath(path, to), getOrReturn(value, relativePath(proxiedPath, from))),
            {}
        );
    };

    private getProxiedPath = (path: string) => {
        const normalPath = relativePath(this.path, path);

        const isIndependent = Object.prototype.hasOwnProperty.call(this.map, normalPath);

        invariant(
            isIndependent ||
                Object.keys(this.map).findIndex(proxiedPath => isInnerPath(normalPath, proxiedPath)) !== -1,
            'Mapping proxy error: trying to proxy value, which is not defined in proxy map.'
        );

        return isIndependent
            ? this.map[normalPath]
            : longestCommonPath(
                  Object.entries(this.map)
                      .filter(([to]) => isInnerPath(normalPath, to))
                      .map(([, from]) => from)
              );
    };
}
