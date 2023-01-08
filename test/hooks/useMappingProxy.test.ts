import { renderHook } from '@testing-library/react-hooks';
import { createPxth, Pxth } from 'pxth';

import { ProxyMapSource, useMappingProxy } from '../../src';

const renderUseMappingProxyHook = <T>(path: Pxth<unknown>, map: ProxyMapSource<T>) =>
	renderHook(({ path, map }) => useMappingProxy(map, path), {
		initialProps: {
			path,
			map,
		},
	});

describe('useMappingProxy', () => {
	it('should return activated proxy', () => {
		const { result } = renderUseMappingProxyHook(createPxth([]), {});

		expect(result.current.isActive()).toBeTruthy();
	});

	it('should return same mapping proxy, if argument values not changed', () => {
		const { result, rerender } = renderUseMappingProxyHook(createPxth([]), { b: createPxth(['c']) });

		const savedResult = result.current;

		rerender({ path: createPxth([]), map: { b: createPxth(['c']) } });

		expect(savedResult).toBe(result.current);
	});

	it('should return new mapping proxy, when map changes', () => {
		const { result, rerender } = renderUseMappingProxyHook(createPxth([]), { b: createPxth(['c']) });

		const savedResult = result.current;
		rerender({ path: createPxth([]), map: { b: createPxth(['d']) } });

		expect(savedResult).not.toBe(result.current);

		const savedResult2 = result.current;
		rerender({ path: createPxth([]), map: { b: createPxth(['d']) } });

		expect(savedResult2).toBe(result.current);
	});

	it('should return new mapping proxy, when path changes', () => {
		const { result, rerender } = renderUseMappingProxyHook(createPxth([]), { b: createPxth(['c']) });

		const savedResult = result.current;
		rerender({ path: createPxth(['a']), map: { b: createPxth(['c']) } });

		expect(savedResult).not.toBe(result.current);
	});
});
