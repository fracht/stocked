import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { createPxth, Pxth } from 'pxth';

import { Stock, StockContext, useStock, useStockState } from '../../src';

const initialValues = {
	hello: 'test',
	parent: {
		child: 'value',
	},
	value: 0,
	array: [
		1,
		{
			value: 'second',
		},
	],
};

let stock: Stock<typeof initialValues>;

const wrapper: React.FC = ({ children }) => (
	<StockContext.Provider value={stock as unknown as Stock<object>}>{children}</StockContext.Provider>
);

const renderUseStockState = (path: Pxth<unknown>, useContext = true) =>
	renderHook(() => useStockState(path, useContext ? undefined : stock), {
		wrapper: useContext ? wrapper : undefined,
	});

beforeEach(() => {
	const { result } = renderHook(() => useStock({ initialValues }), { wrapper });
	stock = result.current;
});

const testWrapper = (testName: string, useContext: boolean) => {
	describe(testName, () => {
		it('Should set value via setter', async () => {
			const { result } = renderUseStockState(createPxth(['parent', 'child']), useContext);

			const [, setValue] = result.current;
			const newValue = 'newValue';

			setValue(newValue);

			await waitFor(() => expect(result.current[0]).toBe(newValue));
		});

		it('Should set value via updater function', async () => {
			const { result } = renderUseStockState(createPxth(['parent', 'child']), useContext);

			const [, setValue] = result.current;
			setValue(() => 'value_changed_via_updater');

			await waitFor(() => expect(result.current[0]).toBe('value_changed_via_updater'));
		});

		it('Value updater should receive actual value', async () => {
			const { result } = renderUseStockState(createPxth(['value']), useContext);

			const [, setValue] = result.current;
			const updater = (value: number) => ++value;
			setValue(updater);
			setValue(updater);
			setValue(updater);

			await waitFor(() => expect(result.current[0]).toBe(3));
		});

		it('Should update when externally set value', async () => {
			const { result } = renderUseStockState(createPxth(['hello']), useContext);

			expect(result.current[0]).toBe(initialValues.hello);

			const newValue = 'newValue';

			stock.setValue(createPxth(['hello']), newValue);

			await waitFor(() => expect(result.current[0]).toBe(newValue));
		});
	});
};

testWrapper('Testing "useStockState" with context stock', true);
testWrapper('Testing "useStockState" with provided into arguments stock', false);
