import React from 'react';
import { render } from '@testing-library/react';
import { createPxth } from 'pxth';

import { Stock, StockRoot, useStockContext } from '../../src';

const StockExtractor = ({
	children,
	logStock,
}: {
	children?: React.ReactNode;
	logStock: (stock: Stock<any>) => void;
}) => {
	const stock = useStockContext();

	logStock(stock);

	return <div>{children}</div>;
};

describe('StockRoot context testing', () => {
	it('should pass clone of initialValues into context', () => {
		const initialValues = {
			hello: 'asdf',
			parent: {
				child: {
					value: 'test',
				},
			},
			array: [
				0,
				{
					nested: 'value',
				},
			],
		};

		let realValues: object | undefined = undefined;

		render(
			<StockRoot initialValues={initialValues}>
				<div>
					<h2>Test component</h2>
					<p>other component</p>
					<StockExtractor logStock={(stock) => (realValues = stock.getValues())} />
				</div>
			</StockRoot>,
		);

		expect(realValues).toStrictEqual(initialValues);
	});
});

describe('StockRoot performance testing', () => {
	it('should never rerender StockRoot', () => {
		const RerenderCounter: React.FC = jest.fn(() => <div />);

		let stock: Stock<any> | undefined = undefined;

		render(
			<StockRoot initialValues={{}}>
				<RerenderCounter />
				<StockExtractor logStock={(_stock) => (stock = _stock)} />
			</StockRoot>,
		);

		if (stock) {
			const _stock = stock as any;
			_stock.setValue(createPxth(['hello']), 'asdf');
			_stock.setValue(createPxth(['nested', 'value']), 3);
			_stock.setValue(createPxth(['asdfasd', 'asdf', 'asdf']), 'asdf');
		}

		expect(RerenderCounter).toBeCalledTimes(1);
	});
});
