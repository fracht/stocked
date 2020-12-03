import { useCallback, useContext } from 'react';
import invariant from 'tiny-invariant';
import { StockContext } from '../components/StockContext';
import { Stock } from './useStock';
import { useStockValue } from './useStockValue';
import isFunction from 'lodash/isFunction';

type SetStateAction<S> = S | ((value: S) => S);
type Dispatch<A> = (value: A) => void;

/**
 * Hook, returns tuple of value and value set action.
 * Returns *actual* value.
 * This means, this hook fires re-render each time value in stock was changed.
 * Similar to standard React's `useState` hook.
 * @param path  - path to variable in stock, deeply gets value. @see https://lodash.com/docs/4.17.15#get
 * @param stock - optional parameter, if you want to work with custom stock, not received from context.
 */
export const useStockState = <V, T extends object = object>(
    path: string,
    stock?: Stock<T>
): [V, Dispatch<SetStateAction<V>>] => {
    const stockContext: Stock<T> | undefined = (useContext(StockContext) as unknown) as Stock<T> | undefined;

    stock = stock ?? stockContext;

    invariant(stock, "You're trying to access stock value outside stock context and without providing custom stock.");

    const value = useStockValue<V, T>(path, stock);

    const { setValue } = stock;

    const set = useCallback(
        (action: SetStateAction<V>) => {
            const newValue = isFunction(action) ? action(value) : action;
            setValue(path, newValue);
        },
        [path, setValue]
    );

    return [value, set];
};
