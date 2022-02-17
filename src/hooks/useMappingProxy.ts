import { useEffect, useMemo, useRef } from 'react';
import { Pxth, pxthToString } from 'pxth';

import { MappingProxy, ProxyMap } from '../typings';
import { areProxyMapsEqual } from '../utils/areProxyMapsEqual';

const useMapMemo = <V>(map: ProxyMap<V>): ProxyMap<V> => {
    const mapRef = useRef(map);

    useEffect(() => {
        if (!areProxyMapsEqual(mapRef.current, map)) {
            mapRef.current = map;
        }
    }, [map]);

    return areProxyMapsEqual(mapRef.current, map) ? mapRef.current : map;
};

export const useMappingProxy = <V>(map: ProxyMap<V>, path: Pxth<V>) => {
    const realMap = useMapMemo(map);

    return useMemo(() => {
        const proxy = new MappingProxy(realMap, path);
        proxy.activate();
        return proxy;
    }, [pxthToString(path), realMap]);
};
