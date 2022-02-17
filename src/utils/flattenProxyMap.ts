import { createPxth, Pxth, pxthToString, RootPathToken } from 'pxth';

import { joinPaths } from './pathUtils';
import { FlattenMapType } from '../typings/MappingProxy';
import { ProxyMap } from '../typings/ProxyMap';

const getAllObjectKeys = (obj: object) => [...Object.getOwnPropertyNames(obj), ...Object.getOwnPropertySymbols(obj)];

export const flattenProxyMap = <V>(map: ProxyMap<V>): Partial<FlattenMapType> => {
    if (getAllObjectKeys(map).length === 0) return {};

    const queue: Array<[Pxth<unknown>, object]> = [[createPxth([]), map]];

    const result: Partial<FlattenMapType> = {};

    while (queue.length) {
        const [pathToObject, innerObject] = queue.shift()!;

        getAllObjectKeys(innerObject).forEach(key => {
            const item = innerObject[key];

            if (key === RootPathToken) {
                result[RootPathToken] = item;
                return;
            }

            const pathToItem = joinPaths(pathToObject, createPxth([key]));
            if (typeof item !== 'object' || item === null || Object.keys(item).length === 0) {
                result[pxthToString(pathToItem) as string] = item;
            } else {
                queue.push([pathToItem, item]);
            }
        });
    }

    return result;
};
