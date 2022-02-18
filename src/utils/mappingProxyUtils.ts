import { Pxth, pxthToString } from 'pxth';

import { isInnerPath } from './pathUtils';
import { ProxyMap } from '../typings/ProxyMap';

export const getInnerPaths = <V>(path: Pxth<V>, proxyMap: ProxyMap) => {
    const stringifiedPath = pxthToString(path);
    return proxyMap.entries().filter(([to]) => {
        const stringifiedTo = pxthToString(to);
        return isInnerPath(stringifiedPath, stringifiedTo) || stringifiedPath === stringifiedTo;
    });
};

export const hasMappedParentPaths = <V>(path: Pxth<V>, proxyMap: ProxyMap) => {
    const stringifiedPath = pxthToString(path);
    return proxyMap.entries().some(([mappedPath]) => isInnerPath(pxthToString(mappedPath), stringifiedPath));
};
