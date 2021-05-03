import { act, renderHook } from '@testing-library/react-hooks';
import { useMappingProxy } from '../../src';

const renderUseMappingProxyHook = (path: string, map: Record<string, string>) =>
    renderHook(({ path, map }) => useMappingProxy(map, path), {
        initialProps: {
            path,
            map,
        },
    });

describe('useMappingProxy', () => {
    it('should return activated proxy', () => {
        const { result } = renderUseMappingProxyHook('', {});

        expect(result.current.isActive()).toBeTruthy();
    });

    it('should memoize proxy', () => {
        const map = {};
        const { result, rerender } = renderUseMappingProxyHook('', map);

        const firstResult = result.current;

        act(() => {
            rerender({ path: '', map });
        });

        expect(result.current).toBe(firstResult);

        act(() => {
            rerender({ path: '', map: { a: '' } });
        });

        expect(result.current).not.toBe(firstResult);
        expect(result.current.isActive()).toBeTruthy();
    });
});
