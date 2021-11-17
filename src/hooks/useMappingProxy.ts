import { useEffect, useMemo, useRef } from 'react';
import { Pxth, pxthToString } from 'pxth';

import { MappingProxy } from '../typings';
import { areProxyMapsEqual } from '../utils/areProxyMapsEqual';

const useMapMemo = (map: Record<string, Pxth<unknown>>) => {
    const mapRef = useRef(map);

    useEffect(() => {
        if (!areProxyMapsEqual(mapRef.current, map)) {
            mapRef.current = map;
        }
    }, [map]);

    return areProxyMapsEqual(mapRef.current, map) ? mapRef.current : map;
};

export const useMappingProxy = <V>(map: Record<string, Pxth<unknown>>, path: Pxth<V>) => {
    const realMap = useMapMemo(map);

    return useMemo(() => {
        const proxy = new MappingProxy(realMap, path);
        proxy.activate();
        return proxy;
    }, [pxthToString(path), realMap]);
};
