import { useMemo } from 'react';

import { ROOT_PATH } from './useObservers';
import { MappingProxy } from '../typings';

export const useMappingProxy = (map: Record<string, string>, path: string | typeof ROOT_PATH) => {
    return useMemo(() => {
        const proxy = new MappingProxy(map, path);
        proxy.activate();
        return proxy;
    }, [path, map]);
};
