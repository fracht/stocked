import { createContext } from 'react';

import { Stock } from '../hooks/useStock';

export const StockContext = createContext<Stock<object> | undefined>(undefined);
