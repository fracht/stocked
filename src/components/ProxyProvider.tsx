import React, { PropsWithChildren } from 'react';

import { ProxyContext } from './ProxyContext';
import { StockContext } from './StockContext';
import { useStockContext } from '../hooks';
import { StockProxy } from '../typings';

export type ProxyProviderProps = PropsWithChildren<{
    proxy: StockProxy<unknown>;
}>;

export const ProxyProvider = ({ proxy, children }: ProxyProviderProps) => {
    const stock = useStockContext();

    return (
        <StockContext.Provider value={stock}>
            <ProxyContext.Provider value={proxy}>{children}</ProxyContext.Provider>
        </StockContext.Provider>
    );
};
