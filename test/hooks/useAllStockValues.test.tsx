import React from 'react';
import { act, renderHook } from '@testing-library/react-hooks';
import { createPxth } from 'pxth';

import { Stock, StockContext, useAllStockValues, useStock } from '../../src';

const initialValues = {
	hello: 'test',
	parent: {
		child: 'value',
	},
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

const renderUseStockValues = () =>
	renderHook(() => useAllStockValues(stock), {
		wrapper,
	});

beforeEach(() => {
	const { result } = renderHook(() => useStock({ initialValues }), { wrapper });
	stock = result.current;
});

describe('Testing "useStockValues" with context stock', () => {
	it('Should return new values after update using setValues', async () => {
		const { result, waitForNextUpdate } = renderUseStockValues();

		expect(result.current).toStrictEqual(initialValues);

		const promise = act(async () => {
			await waitForNextUpdate({ timeout: 1000 });
		});

		const newValue = {
			hello: 'changed',
			parent: {
				child: 'changed',
			},
			array: [
				42,
				{
					value: 'changed',
				},
			],
		};

		stock.setValues(newValue);

		await promise;

		expect(result.current).toStrictEqual(newValue);
	});
	it('Should return new values after update using setValue', async () => {
		const { result, waitForNextUpdate } = renderUseStockValues();

		expect(result.current).toStrictEqual(initialValues);

		const promise = act(async () => {
			await waitForNextUpdate({ timeout: 1000 });
		});

		const newValue = [1, 42];

		stock.setValue(createPxth(['array']), newValue);

		await promise;

		expect(result.current).toStrictEqual({
			hello: 'test',
			parent: {
				child: 'value',
			},
			array: [1, 42],
		});
	});
});
