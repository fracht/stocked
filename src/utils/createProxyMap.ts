import { createPxth, isPxth, joinPxths, Pxth } from 'pxth';
import invariant from 'tiny-invariant';

import { ProxyMap } from '../typings/ProxyMap';
import { ProxyMapSource } from '../typings/ProxyMapSource';

const getAllObjectKeys = (obj: object) => [...Object.getOwnPropertyNames(obj), ...Object.getOwnPropertySymbols(obj)];

export const createProxyMap = <T>(mapSource: ProxyMapSource<T>) => {
    const proxyMap = new ProxyMap();

    if (isPxth(mapSource)) {
        proxyMap.set(createPxth([]), mapSource);
        return proxyMap;
    }

    const queue: Array<[key: Pxth<unknown>, value: Record<string | symbol, unknown>]> = [[createPxth([]), mapSource]];

    while (queue.length) {
        const [pathToObject, innerObject] = queue.shift()!;

        for (const key of getAllObjectKeys(innerObject)) {
            const item = innerObject[key] as Pxth<unknown> | ProxyMapSource<unknown>;

            const pathToItem = joinPxths(pathToObject, createPxth([key]));

            if (isPxth(item)) {
                proxyMap.set(pathToItem, item);
            } else if (typeof item === 'object' && item !== null) {
                queue.push([pathToItem, item as Record<string | symbol, unknown>]);
            } else {
                invariant(false, 'Invalid proxy map passed.');
            }
        }
    }

    return proxyMap;
};
