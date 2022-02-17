import { Pxth, pxthToString } from 'pxth';

import { flattenObject } from './flattenObject';
import { ProxyMap } from '../typings/ProxyMap';

export const areProxyMapsEqual = (a: ProxyMap<unknown>, b: ProxyMap<unknown>) => {
    const flattenA = flattenObject(a) as Record<string, Pxth<unknown>>;
    const flattenB = flattenObject(b) as Record<string, Pxth<unknown>>;

    const aEntries = Object.entries(flattenA);

    if (aEntries.length !== Object.entries(flattenB).length) {
        return false;
    }

    for (const [key, value] of aEntries) {
        if (
            typeof flattenB[key] !== 'object' ||
            flattenB[key] === null ||
            pxthToString(flattenB[key]) !== pxthToString(value)
        ) {
            return false;
        }
    }

    return true;
};
