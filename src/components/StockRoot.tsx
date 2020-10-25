import React from 'react';
import { Stock, StockConfig, useStock } from '../hooks';
import { StockContext } from './StockContext';

export type StockRootProps<Values extends object> = StockConfig<Values> & {
    children: React.ReactNode;
};

export const StockRoot = <Values extends object>({ children, ...stockConfig }: StockRootProps<Values>) => {
    const stock = useStock(stockConfig);

    return <StockContext.Provider value={(stock as unknown) as Stock<object>}>{children}</StockContext.Provider>;
};