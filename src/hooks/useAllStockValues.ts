import { ROOT_PATH } from './useObservers';
import { Stock } from './useStock';
import { useStockValue } from './useStockValue';
import { StockProxy } from '../typings/StockProxy';

export const useAllStockValues = <T extends object = object>(customStock?: Stock<T>, proxy?: StockProxy): T => {
    return useStockValue<T, T>((ROOT_PATH as unknown) as string, customStock, proxy);
};
