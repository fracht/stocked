import { useEffect, useMemo, useRef } from 'react';
import { Pxth } from 'pxth';

import { MappingProxy, ProxyMapSource } from '../typings';
import { areProxyMapsEqual } from '../utils/areProxyMapsEqual';
import { hashPxth } from '../utils/hashPxth';

const useMapMemo = <V>(map: ProxyMapSource<V>): ProxyMapSource<V> => {
    const mapRef = useRef(map);

    useEffect(() => {
        if (!areProxyMapsEqual(mapRef.current, map)) {
            mapRef.current = map;
        }
    }, [map]);

    return areProxyMapsEqual(mapRef.current, map) ? mapRef.current : map;
};

export const useMappingProxy = <V>(mapSource: ProxyMapSource<V>, path: Pxth<V>) => {
    const realMap = useMapMemo(mapSource);

    return useMemo(() => {
        const proxy = new MappingProxy(realMap, path);
        proxy.activate();
        return proxy;
    }, [hashPxth(path), realMap]);
};
