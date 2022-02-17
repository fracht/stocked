import { pxthToString } from 'pxth';

import { flattenProxyMap } from './flattenProxyMap';
import { ProxyMap } from '../typings/ProxyMap';

export const areProxyMapsEqual = (a: ProxyMap<unknown>, b: ProxyMap<unknown>) => {
    const flattenA = flattenProxyMap(a);
    const flattenB = flattenProxyMap(b);

    const aEntries = Object.entries(flattenA);

    if (aEntries.length !== Object.entries(flattenB).length) {
        return false;
    }

    for (const [key, value] of aEntries) {
        if (
            typeof flattenB[key] !== 'object' ||
            flattenB[key] === null ||
            pxthToString(flattenB[key]!) !== pxthToString(value!)
        ) {
            return false;
        }
    }

    return true;
};
