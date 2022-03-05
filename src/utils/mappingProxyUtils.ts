import { isInnerPxth, Pxth, samePxth } from 'pxth';

import { ProxyMap } from '../typings/ProxyMap';

export const getInnerPaths = <V>(path: Pxth<V>, proxyMap: ProxyMap) => {
    return proxyMap.entries().filter(([to]) => {
        return isInnerPxth(path as Pxth<unknown>, to) || samePxth(path as Pxth<unknown>, to);
    });
};

export const hasMappedParentPaths = <V>(path: Pxth<V>, proxyMap: ProxyMap) => {
    return proxyMap.entries().some(([mappedPath]) => isInnerPxth(mappedPath, path as Pxth<unknown>));
};
