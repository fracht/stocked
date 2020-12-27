import { useContext } from 'react';
import invariant from 'tiny-invariant';
import { StockContext } from '../components';
import { ProxyContext } from '../components/ProxyContext';
import { StockProxy } from '../typings';
import { useInterceptors } from '../utils/useInterceptors';
import { Stock } from './useStock';

/**
 * Function to access stock, with automatically applying proxy. By default, will pick stock and proxy from context.
 * @param stock - optional argument. Pass it if you don't want to use stock from context.
 * @param proxy - optional argument. Pass it if you don't want to use proxy from context.
 */
export const useStockContext = <T extends object>(stock?: Stock<T>, proxy?: StockProxy): Stock<T> => {
    const contextStock = useContext(StockContext) as Stock<T> | undefined;
    const contextProxy = useContext(ProxyContext);

    stock = stock ?? contextStock;
    proxy = proxy ?? contextProxy;

    invariant(stock, "You're trying to access stock outside StockContext and without providing custom stock.");

    return useInterceptors(stock, proxy);
};
