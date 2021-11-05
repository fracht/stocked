import React, { PropsWithChildren } from 'react';

import { ProxyContext } from './ProxyContext';
import { StockContext } from './StockContext';
import { useStockContext } from '../hooks';
import { StockProxy } from '../typings';

export type ProxyProviderProps<V> = PropsWithChildren<{
    proxy: StockProxy<V>;
}>;

export const ProxyProvider = <V,>({ proxy, children }: ProxyProviderProps<V>) => {
    const stock = useStockContext();

    return (
        <StockContext.Provider value={stock}>
            <ProxyContext.Provider value={proxy as StockProxy<unknown>}>{children}</ProxyContext.Provider>
        </StockContext.Provider>
    );
};
