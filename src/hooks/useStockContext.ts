import { useContext } from 'react';
import invariant from 'tiny-invariant';
import { ProxyContext } from '../components/ProxyContext';
import { StockContext } from '../components/StockContext';
import { Stock } from './useStock';

/** Access stock context. Throws an error if is used outside StockContext. */
export const useStockContext = <T extends object>(): Stock<T> => {
    const context = useContext(StockContext);

    invariant(context !== undefined, "You're trying to access Stock not within StockContext.");

    const proxyContext = useContext(ProxyContext);

    if (proxyContext) {
    } else {
        return (context as unknown) as Stock<T>;
    }
};
