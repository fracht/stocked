import React from 'react';
import { render } from '@testing-library/react';
import { createPxth } from 'pxth';

import { MappingProxy, ProxyProvider, Stock, StockRoot, useStockContext } from '../../src';

const StockExtractor = ({ extract }: { extract: (stock: Stock<object>) => void }) => {
	const stock = useStockContext();

	extract(stock);

	return <div />;
};

describe('ProxyProvider', () => {
	it('should provide proxy', () => {
		const proxy = new MappingProxy(
			{
				surname: createPxth(['user', 'name']),
			},
			createPxth(['user']),
		);

		proxy.activate();

		let stock: Stock<object> | undefined = undefined;

		render(
			<StockRoot initialValues={{ user: { name: 'hello' } }}>
				<ProxyProvider proxy={proxy}>
					<StockExtractor extract={(value) => (stock = value)} />
				</ProxyProvider>
			</StockRoot>,
		);

		expect(stock!.getValue(createPxth(['user']))).toStrictEqual({
			surname: 'hello',
		});
	});

	it('should handle nested proxies', () => {
		const proxy = new MappingProxy(
			{
				surname: createPxth(['user', 'name']),
			},
			createPxth(['user']),
		);

		const proxy2 = new MappingProxy(
			{
				name: {
					surname: createPxth(['user', 'surname']),
				},
			},
			createPxth(['user']),
		);

		proxy.activate();
		proxy2.activate();

		let stock: Stock<object> | undefined = undefined;

		render(
			<StockRoot initialValues={{ user: { name: 'hello' } }}>
				<ProxyProvider proxy={proxy}>
					<ProxyProvider proxy={proxy2}>
						<StockExtractor extract={(value) => (stock = value)} />
					</ProxyProvider>
				</ProxyProvider>
			</StockRoot>,
		);

		expect(stock!.getValue(createPxth(['user']))).toStrictEqual({
			name: {
				surname: 'hello',
			},
		});
	});
});
