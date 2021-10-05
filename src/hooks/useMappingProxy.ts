import { useMemo } from 'react';
import { Pxth } from 'pxth';

import { MappingProxy } from '../typings';

export const useMappingProxy = <V>(map: Record<string, Pxth<unknown>>, path: Pxth<V>) => {
    return useMemo(() => {
        const proxy = new MappingProxy(map, path);
        proxy.activate();
        return proxy;
    }, [path, map]);
};
