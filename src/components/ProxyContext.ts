import { createContext } from 'react';
import { StockProxy } from '../typings/StockProxy';

export type ProxyContextType = {
    proxies: Record<string, StockProxy<unknown, unknown>>;
};

export const ProxyContext = createContext<ProxyContextType | undefined>(undefined);
