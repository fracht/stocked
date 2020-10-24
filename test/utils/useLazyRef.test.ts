import { useLazyRef } from '../../src/utils/useLazyRef';
import { renderHook } from '@testing-library/react-hooks';

describe('Lazy initializing test', () => {
    it('should initialize once', () => {
        const initializer = jest.fn();

        initializer.mockReturnValue(1);

        const { rerender } = renderHook(() => useLazyRef(initializer));

        rerender();
        rerender();
        rerender();
        rerender();

        expect(initializer).toBeCalledTimes(1);
    });

    it('should return initialized value', () => {
        const initializer = jest.fn();

        initializer.mockReturnValue(1);

        const { result } = renderHook(() => useLazyRef(initializer));

        expect(result.current.current).toBe(1);
    });
});
