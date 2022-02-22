import { createPxth, Pxth } from 'pxth';
import invariant from 'tiny-invariant';

import { isPxth, joinPaths } from './pathUtils';
import { ProxyMap } from '../typings/ProxyMap';
import { ProxyMapSource } from '../typings/ProxyMapSource';

const getAllObjectKeys = (obj: object) => [...Object.getOwnPropertyNames(obj), ...Object.getOwnPropertySymbols(obj)];

export const createProxyMap = <T>(mapSource: ProxyMapSource<T>) => {
    const proxyMap = new ProxyMap();

    // FIXME isPxth returns true for empty object
    if (isPxth(mapSource)) {
        proxyMap.set(createPxth([]), mapSource);
        return proxyMap;
    }

    const queue: Array<[Pxth<unknown>, Record<string | symbol, unknown>]> = [[createPxth([]), mapSource]];

    while (queue.length) {
        const [pathToObject, innerObject] = queue.shift()!;

        for (const key of getAllObjectKeys(innerObject)) {
            const item = innerObject[key];

            const pathToItem = joinPaths(pathToObject, createPxth([key]));

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
