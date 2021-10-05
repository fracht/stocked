import { createContext } from 'react';

import { StockProxy } from '../typings/StockProxy';

export const ProxyContext = createContext<StockProxy<unknown> | undefined>(undefined);
