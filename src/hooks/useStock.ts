import { SetStateAction, useCallback, useMemo } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import isFunction from 'lodash/isFunction';
import { createPxth, deepGet, deepSet, Pxth } from 'pxth';

import { useDebugStock } from './useDebugStock';
import { ObserversControl, useObservers } from './useObservers';
import { useLazyRef } from '../utils/useLazyRef';

export type Stock<T extends object> = {
	/** Function for setting value. Deeply sets value, using path to variable. @see https://lodash.com/docs/4.17.15#set */
	setValue: <V>(path: Pxth<V>, value: SetStateAction<V>) => void;
	/** Function for setting all values. */
	setValues: (values: T) => void;
	/** Get actual value from stock. */
	getValue: <V>(path: Pxth<V>) => V;
	/** Get all values from stock */
	getValues: () => T;
	/** Function for resetting values to initial state */
	resetValues: () => void;
	/** Paths to all variables */
	paths: Pxth<T>;
	/** Name, which appears in stocked devtools */
	debugName?: string;
} & Omit<ObserversControl<T>, 'notifyAll' | 'notifySubTree'>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyStock = Stock<any>;

export type StockConfig<T extends object> = {
	initialValues: T;
	debugName?: string;
};

/**
 * Creates stock.
 *
 * Use it only if you want to use several Stock's at the same time.
 *
 * Instead, use `<StockRoot>` component
 *
 * @param config - configuration of Stock.
 */
export const useStock = <T extends object>({ initialValues, debugName }: StockConfig<T>): Stock<T> => {
	const values = useLazyRef<T>(() => cloneDeep(initialValues));
	const { notifySubTree, notifyAll, watch, watchAll, watchBatchUpdates, isObserved } = useObservers<T>();

	const setValue = useCallback(
		<V>(path: Pxth<V>, action: SetStateAction<V>) => {
			// path = normalizePath(path as string);

			const value = isFunction(action) ? action(deepGet(values.current, path)) : action;

			values.current = deepSet(values.current, path, value) as T;

			notifySubTree(path, values.current);
		},
		[values, notifySubTree],
	);

	const setValues = useCallback(
		(newValues: T) => {
			values.current = newValues;
			notifyAll(newValues);
		},
		[values, notifyAll],
	);

	const getValue = useCallback(<V>(path: Pxth<V>) => deepGet(values.current, path) as V, [values]);

	const getValues = useCallback(() => values.current, [values]);

	const resetValues = useCallback(() => setValues(cloneDeep(initialValues)), [initialValues, setValues]);

	const stock: Stock<T> = useMemo(
		() => ({
			getValue,
			getValues,
			setValue,
			setValues,
			resetValues,
			watch,
			watchAll,
			watchBatchUpdates,
			isObserved,
			debugName,
			paths: createPxth<T>([]),
		}),
		[
			getValue,
			getValues,
			debugName,
			setValue,
			setValues,
			resetValues,
			watch,
			watchAll,
			watchBatchUpdates,
			isObserved,
		],
	);

	useDebugStock(stock);

	return stock;
};
