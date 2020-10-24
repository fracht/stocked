import { useContext } from 'react';
import invariant from 'tiny-invariant';
import { StockContext } from '../components';
import { Stock } from './useStock';

export const useStockContext = <T extends object>(): Stock<T> => {
    const context = useContext(StockContext);

    invariant(context !== undefined, "You're trying to access Stock not within StockContext.");

    return context as Stock<T>;
};
