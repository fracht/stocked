import { useMemo } from 'react';
import { MappingProxy } from '../typings';
import { ROOT_PATH } from './useObservers';

export const useMappingProxy = (map: Record<string, string>, path: string | typeof ROOT_PATH) => {
    return useMemo(() => {
        const proxy = new MappingProxy(map, path);
        proxy.activate();
        return proxy;
    }, [path, map]);
};
