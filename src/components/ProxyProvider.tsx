import React from 'react';
import { Pxth } from 'pxth';

import { ProxyContext } from './ProxyContext';
import { StockContext } from './StockContext';
import { useStockContext } from '../hooks';
import { StockProxy } from '../typings';

export type ProxyProviderProps<V> = {
    proxy: StockProxy<V>;
    children: React.ReactNode | ((path: Pxth<V>) => React.ReactNode);
};

export const ProxyProvider = <V,>({ proxy, children }: ProxyProviderProps<V>) => {
    const stock = useStockContext();

    return (
        <StockContext.Provider value={stock}>
            <ProxyContext.Provider value={proxy as StockProxy<unknown>}>
                {typeof children === 'function' ? children(proxy.path) : children}
            </ProxyContext.Provider>
        </StockContext.Provider>
    );
};
