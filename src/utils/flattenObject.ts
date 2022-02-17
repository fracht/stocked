import { createPxth, Pxth, pxthToString } from 'pxth';

import { joinPaths } from './pathUtils';

export const flattenObject = (obj: object): Record<string, unknown> => {
    const queue: Array<[Pxth<unknown>, object]> = [[createPxth([]), obj]];

    const result: Record<string, unknown> = {};

    while (queue.length) {
        const [pathToObject, innerObject] = queue.shift()!;

        for (const key in innerObject) {
            const item = innerObject[key];
            const pathToItem = joinPaths(pathToObject, createPxth([key]));
            if (typeof item !== 'object' || item === null || Object.keys(item).length === 0) {
                result[pxthToString(pathToItem) as string] = item;
            } else {
                queue.push([pathToItem, item]);
            }
        }
    }

    return result;
};
