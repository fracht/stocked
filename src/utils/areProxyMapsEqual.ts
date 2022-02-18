import { deepGet, Pxth } from 'pxth';

import { createProxyMap } from './createProxyMap';
import { samePxth } from './pathUtils';
import { ProxyMapSource } from '../typings/ProxyMapSource';

export const areProxyMapsEqual = (map1: ProxyMapSource<unknown>, map2: ProxyMapSource<unknown>) => {
    const proxyMap1 = createProxyMap(map1);
    const proxyMap2 = createProxyMap(map2);

    if (proxyMap1.entries().length !== proxyMap2.entries().length) {
        return false;
    }

    for (const [key, value] of proxyMap1.entries()) {
        const value2 = deepGet(map2, key) as Pxth<unknown>;
        if (!value2 || !samePxth(value, value2)) {
            return false;
        }
    }

    return true;
};
