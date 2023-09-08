import React, { PropsWithChildren } from 'react';
import { act, renderHook } from '@testing-library/react-hooks';
import { createPxth, getPxthSegments } from 'pxth';

import { StockContext, useStock, useStockContext } from '../../src';
import { ProxyContext } from '../../src/components/ProxyContext';
import { DummyProxy } from '../DummyProxy';

describe('Test "useStockContext" hook', () => {
	it('should throw error', () => {
		const { result } = renderHook(() => useStockContext());

		expect(result.error).toBeDefined();
	});

	it('should return stock from context', () => {
		const {
			result: { current: stock },
		} = renderHook(() => useStock({ initialValues: {} }));

		const wrapper = ({ children }: PropsWithChildren<{}>) => (
			<StockContext.Provider value={stock}>{children}</StockContext.Provider>
		);

		const { result } = renderHook(() => useStockContext(), { wrapper });

		expect(result.current).toBe(stock);
	});

	it('should return stock from arguments', () => {
		const {
			result: { current: stock },
		} = renderHook(() => useStock({ initialValues: {} }));

		const { result } = renderHook(() => useStockContext(stock));

		expect(result.current).toBe(stock);
	});

	it('should take proxy from context', () => {
		const {
			result: { current: stock },
		} = renderHook(() => useStock({ initialValues: {} }));

		const proxy = new DummyProxy(createPxth(['asdf']));

		const watch = jest.fn();

		proxy.watch = watch;

		proxy.activate();

		const wrapper = ({ children }: PropsWithChildren<{}>) => (
			<ProxyContext.Provider value={proxy}>{children}</ProxyContext.Provider>
		);

		const { result } = renderHook(() => useStockContext(stock), { wrapper });

		expect(result.current).not.toBe(stock);

		const observer = jest.fn();

		act(() => {
			result.current.watch(createPxth(['asdf']), observer);
			result.current.watch(createPxth(['aaaa']), () => {});
		});

		expect(getPxthSegments(watch.mock.calls[watch.mock.calls.length - 1][0])).toStrictEqual(['asdf']);

		expect(watch).lastCalledWith(expect.anything(), observer, expect.any(Function));
	});

	it('should take proxy from arguments', () => {
		const {
			result: { current: stock },
		} = renderHook(() => useStock({ initialValues: {} }));

		const proxy = new DummyProxy(createPxth(['asdf']));

		const watch = jest.fn();

		proxy.watch = watch;

		proxy.activate();

		const { result } = renderHook(() => useStockContext(stock, proxy));

		expect(result.current).not.toBe(stock);

		const observer = jest.fn();

		act(() => {
			result.current.watch(createPxth(['asdf']), observer);
			result.current.watch(createPxth(['aaaa']), () => {});
		});

		expect(getPxthSegments(watch.mock.calls[watch.mock.calls.length - 1][0])).toStrictEqual(['asdf']);
		expect(watch).lastCalledWith(expect.anything(), observer, expect.any(Function));
	});
});
