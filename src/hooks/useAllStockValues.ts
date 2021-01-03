import { Stock } from './useStock';
import { StockProxy } from '../typings';
import { useStockValue } from './useStockValue';
import { ROOT_PATH } from './useObservers';

export const useAllStockValues = <T extends object = object>(customStock?: Stock<T>, proxy?: StockProxy) => {
    return useStockValue((ROOT_PATH as unknown) as string, customStock, proxy);
};
