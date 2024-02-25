import { samePxth } from 'pxth';

import { createProxyMap } from './createProxyMap';
import { ProxyMapSource } from '../typings/ProxyMapSource';

export const areProxyMapsEqual = (map1: ProxyMapSource<unknown>, map2: ProxyMapSource<unknown>) => {
	const proxyMap1 = createProxyMap(map1);
	const proxyMap2 = createProxyMap(map2);

	if (proxyMap1.entries().length !== proxyMap2.entries().length) {
		return false;
	}

	for (const [key, value] of proxyMap1.entries()) {
		const value2 = proxyMap2.get(key);
		if (!proxyMap2.has(key) || !samePxth(value, value2!)) {
			return false;
		}
	}

	return true;
};
