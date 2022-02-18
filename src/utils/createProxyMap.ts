import { createPxth, Pxth } from 'pxth';

import { joinPaths } from './pathUtils';
import { ProxyMap } from '../typings/ProxyMap';
import { ProxyMapSource } from '../typings/ProxyMapSource';

const getAllObjectKeys = (obj: object) => [...Object.getOwnPropertyNames(obj), ...Object.getOwnPropertySymbols(obj)];

// TODO implement this function in pxth package
const isPxth = (value: unknown): value is Pxth<unknown> => {
    return typeof value === 'object' && value !== null && Object.keys(value).length === 0;
};

export const createProxyMap = <T>(mapSource: ProxyMapSource<T>) => {
    const proxyMap = new ProxyMap();

    const queue: Array<[Pxth<unknown>, Record<string | symbol, unknown>]> = [[createPxth([]), mapSource]];

    while (queue.length) {
        const [pathToObject, innerObject] = queue.shift()!;

        getAllObjectKeys(innerObject).forEach(key => {
            const item = innerObject[key];

            const pathToItem = joinPaths(pathToObject, createPxth([key]));

            if (isPxth(item)) {
                proxyMap.set(pathToItem, item);
            } else if (typeof item === 'object' && item !== null) {
                queue.push([pathToItem, item as Record<string | symbol, unknown>]);
            } else {
                throw new Error('Invalid map passed.');
            }
        });
    }

    return proxyMap;
};
