import React from 'react';
import { Stock, StockConfig, useStock } from '../hooks/useStock';
import { StockContext } from './StockContext';

export type StockRootProps<Values extends object> = StockConfig<Values> & {
    children: React.ReactNode;
};

/**
 * The main component, which should wrap all code, which uses stock values.
 * Creates stock and puts it in `StockContext`.
 */
export const StockRoot = <Values extends object>({ children, ...stockConfig }: StockRootProps<Values>) => {
    const stock = useStock(stockConfig);

    return <StockContext.Provider value={(stock as unknown) as Stock<object>}>{children}</StockContext.Provider>;
};
