import { renderHook } from '@testing-library/react-hooks';
import { createPxth, Pxth } from 'pxth';

import { useMappingProxy } from '../../src';

const renderUseMappingProxyHook = (path: Pxth<unknown>, map: Record<string, Pxth<unknown>>) =>
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
});
