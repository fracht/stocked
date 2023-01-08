import { createPxth, Pxth } from 'pxth';

import { Stock } from './useStock';
import { useStockValue } from './useStockValue';
import { StockProxy } from '../typings/StockProxy';

const rootPxth = createPxth([]);

export const useAllStockValues = <T extends object = object>(
	customStock?: Stock<T>,
	proxy?: StockProxy<unknown>,
): T => {
	return useStockValue<T, T>(rootPxth as unknown as Pxth<T>, customStock, proxy);
};
