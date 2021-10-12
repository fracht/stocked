import { act, renderHook } from '@testing-library/react-hooks';

import { Stock, useDebugStock } from '../../src';

beforeEach(() => {
    if (window.__STOCKED_DEBUG_DATA) {
        delete window.__STOCKED_DEBUG_DATA;
    }
});

describe('useDebugStock', () => {
    it('should initialize global object', () => {
        const stock: Stock<any> = {} as Stock<any>;

        renderHook(useDebugStock, {
            initialProps: stock,
        });

        expect(window.__STOCKED_DEBUG_DATA).toStrictEqual({
            version: expect.any(String),
            stocks: {
                1: {
                    debugName: undefined,
                    stock,
                },
            },
            counter: 1,
        });
    });

    it('should add multiple stocks', () => {
        const stock1: Stock<any> = ({ s: '1' } as unknown) as Stock<any>;
        const stock2: Stock<any> = ({ s: '2' } as unknown) as Stock<any>;

        renderHook(useDebugStock, {
            initialProps: stock1,
        });
        renderHook(useDebugStock, {
            initialProps: stock2,
        });

        expect(window.__STOCKED_DEBUG_DATA).toStrictEqual({
            version: expect.any(String),
            stocks: {
                1: {
                    debugName: undefined,
                    stock: stock1,
                },
                2: {
                    debugName: undefined,
                    stock: stock2,
                },
            },
            counter: 2,
        });
    });

    it('should update stock', () => {
        const stock: Stock<any> = {} as Stock<any>;
        const updatedStock: Stock<any> = ({ helo: 'a' } as unknown) as Stock<any>;

        const { rerender } = renderHook(useDebugStock, {
            initialProps: stock,
        });

        act(() => {
            rerender(updatedStock);
        });

        expect(window.__STOCKED_DEBUG_DATA).toStrictEqual({
            version: expect.any(String),
            stocks: {
                1: {
                    debugName: undefined,
                    stock: updatedStock,
                },
            },
            counter: 1,
        });
    });
});
