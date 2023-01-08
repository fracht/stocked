import { useCallback } from 'react';
import { Pxth } from 'pxth';

import { Stock } from './useStock';
import { useStockContext } from './useStockContext';
import { useStockValue } from './useStockValue';
import { StockProxy } from '../typings';
import { Dispatch, SetStateAction } from '../typings/SetStateAction';

/**
 * Hook, returns tuple of value and value set action.
 * Returns *actual* value.
 * This means, this hook fires re-render each time value in stock was changed.
 * Similar to standard React's `useState` hook.
 * @param path  - path to variable in stock, deeply gets value. @see https://lodash.com/docs/4.17.15#get
 * @param customStock - optional parameter, if you want to work with custom stock, not received from context. @see useStockContext
 * @param proxy       - optional parameter, if you want to pass custom proxy, not receive it from context. @see useStockContext
 */
export const useStockState = <V, T extends object = object>(
	path: Pxth<V>,
	customStock?: Stock<T>,
	proxy?: StockProxy<unknown>,
): [V, Dispatch<SetStateAction<V>>] => {
	const stock = useStockContext(customStock, proxy);

	const value = useStockValue<V, T>(path, customStock, proxy);

	const { setValue } = stock;

	const set = useCallback((action: SetStateAction<V>) => setValue(path, action), [path, setValue]);

	return [value, set];
};
