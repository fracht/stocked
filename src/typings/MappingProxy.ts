import isNil from 'lodash/isNil';
import { deepGet, deepSet, isInnerPxth, joinPxths, longestCommonPxth, Pxth, relativePxth, samePxth } from 'pxth';
import invariant from 'tiny-invariant';

import { Observer } from './Observer';
import { PxthMap } from './PxthMap';
import { StockProxy } from './StockProxy';
import { ProxyMapSource } from '.';
import { createProxyMap } from '../utils/createProxyMap';
import { getInnerPaths, hasMappedParentPaths } from '../utils/mappingProxyUtils';

/**
 * Simple example of StockProxy.
 * Proxies values by map. Map is built by this method:
 * {
 *      a: {
 *          b: {
 *              c: "<path to real value, in stock>"
 *          },
 *      }
 * }
 */
export class MappingProxy<T> extends StockProxy<T> {
	private readonly proxyMap: PxthMap<Pxth<unknown>>;

	public constructor(mapSource: ProxyMapSource<T>, path: Pxth<T>) {
		super(path);
		this.proxyMap = createProxyMap(mapSource);
	}

	public setValue = <V>(path: Pxth<V>, value: V, defaultSetValue: <U>(path: Pxth<U>, value: U) => void) => {
		const relativeValuePath = relativePxth(this.path as Pxth<unknown>, path as Pxth<unknown>);

		if (hasMappedParentPaths(relativeValuePath, this.proxyMap)) {
			const normalPath = this.getNormalPath(path);
			defaultSetValue(normalPath, value);
			return;
		}

		const innerPaths = getInnerPaths(relativeValuePath, this.proxyMap);

		innerPaths.forEach(
			([to, from]) =>
				from !== undefined && defaultSetValue(from, deepGet(value, relativePxth(relativeValuePath, to))),
		);
	};

	public watch = <V>(
		path: Pxth<V>,
		observer: Observer<V>,
		defaultWatch: <U>(path: Pxth<U>, observer: Observer<U>) => () => void,
	) => {
		const normalPath = this.getNormalPath(path);
		return defaultWatch(normalPath, (value) => observer(this.mapValue(value, path, normalPath) as V));
	};

	public getValue = <V>(path: Pxth<V>, defaultGetValue: <U>(path: Pxth<U>) => U): V => {
		const normalPath = this.getNormalPath(path);
		return this.mapValue(defaultGetValue(normalPath), path, normalPath) as V;
	};

	private mapValue = <V>(value: V, path: Pxth<V>, normalPath: Pxth<V>): V => {
		path = relativePxth(this.path as Pxth<unknown>, path as Pxth<unknown>) as Pxth<V>;

		if (hasMappedParentPaths(path, this.proxyMap)) {
			return value;
		}

		const innerPaths = getInnerPaths(path, this.proxyMap);

		return innerPaths.reduce<V>(
			(acc, [to, from]) =>
				deepSet(
					acc as unknown as object,
					relativePxth(path as Pxth<unknown>, to),
					deepGet(value, relativePxth(normalPath as Pxth<unknown>, from!)),
				) as V,
			{} as V,
		);
	};

	public getProxiedPath = <V>(path: Pxth<V>): Pxth<V> => {
		const normalPath = this.proxyMap.entries().find(([, from]) => samePxth(from, path as Pxth<unknown>))?.[0];

		invariant(
			!isNil(normalPath),
			'Mapping proxy error: trying to get normal path of proxied path, which is not defined in proxy map',
		);

		return joinPxths(this.path as Pxth<unknown>, normalPath) as Pxth<V>;
	};

	public getNormalPath = <V>(path: Pxth<V>): Pxth<V> => {
		const normalPath = relativePxth(this.path as Pxth<unknown>, path as Pxth<unknown>);

		const isIndependent = this.proxyMap.has(normalPath);

		if (isIndependent) {
			return this.proxyMap.get(normalPath) as Pxth<V>;
		}

		const hasMappedChildrenPaths = this.proxyMap.keys().some((mappedPath) => isInnerPxth(normalPath, mappedPath));

		if (hasMappedChildrenPaths) {
			return longestCommonPxth(
				this.proxyMap
					.entries()
					.filter(([to]) => isInnerPxth(normalPath, to))
					.map(([, from]) => from),
			) as Pxth<V>;
		}

		if (hasMappedParentPaths(normalPath, this.proxyMap)) {
			const [to, from] = this.proxyMap.entries().find(([mappedPath]) => isInnerPxth(mappedPath, normalPath))!;

			return joinPxths(from!, relativePxth(to, normalPath)) as Pxth<V>;
		}

		invariant(false, 'Mapping proxy error: trying to proxy value, which is not defined in proxy map.');
	};
}
