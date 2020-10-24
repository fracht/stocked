import React from 'react';
import { useStockContext, StockContext, useStock } from '../../src';
import { renderHook } from '@testing-library/react-hooks';

describe('Test "useStockContext" hook', () => {
    it('should throw error', () => {
        const { result } = renderHook(() => useStockContext());

        expect(result.error).toBeDefined();
    });

    it('should return stock', () => {
        const {
            result: { current: stock },
        } = renderHook(() => useStock({ initialValues: {} }));

        const wrapper: React.FC = ({ children }) => (
            <StockContext.Provider value={stock}>{children}</StockContext.Provider>
        );

        const { result } = renderHook(() => useStockContext(), { wrapper });

        expect(result.current).toBe(stock);
    });
});
