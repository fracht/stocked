import { act, renderHook } from '@testing-library/react-hooks';
import { createPxth, getPxthSegments, Pxth } from 'pxth';

import { Stock, StockProxy, useStock } from '../../src';
import { intercept, useInterceptors } from '../../src/utils/useInterceptors';
import { DummyProxy } from '../DummyProxy';

const initialValues = {
	hello: '',
	dest: {
		bye: 'asdf',
		l: 0,
	},
};

let stock: Stock<typeof initialValues> | undefined;

const renderUseInterceptorsHook = (proxy?: StockProxy<unknown>) => renderHook(() => useInterceptors(stock!, proxy));

beforeEach(() => {
	const { result } = renderHook(() => useStock({ initialValues }));

	stock = result.current;
});

describe('hit cases', () => {
	it('no proxy', () => {
		const { result } = renderUseInterceptorsHook();

		const observer = jest.fn();
		act(() => {
			const cleanup = result.current.watch(createPxth(['hello']), observer);
			result.current.setValue(createPxth(['hello']), 'asdf');
			cleanup();
			result.current.setValue(createPxth(['hello']), 'ba');
		});

		expect(observer).toBeCalledTimes(1);
		expect(observer).toBeCalledWith('asdf');
	});
	it('non activated proxy', () => {
		const { result } = renderUseInterceptorsHook(new DummyProxy(createPxth(['asdf'])));
		expect(result.error).toBeDefined();
	});
});

describe('intercept', () => {
	it('no proxy', () => {
		const standard = jest.fn();
		const custom = jest.fn();
		intercept(undefined, createPxth([]), standard, custom, []);
		expect(standard).toBeCalled();
		expect(custom).not.toBeCalled();
	});
	it('proxy', () => {
		const proxy = new DummyProxy(createPxth(['asdf']));
		const standard = jest.fn();
		const custom = jest.fn();
		intercept(proxy, createPxth(['asdf']), standard, custom, []);
		expect(standard).not.toBeCalled();
		expect(custom).toBeCalled();
	});
	it('proxy (nested interception)', () => {
		const proxy = new DummyProxy(createPxth(['asdf']));
		const standard = jest.fn();
		const custom = jest.fn();
		intercept(proxy, createPxth(['asdf', 'hello', 'b']), standard, custom, []);
		expect(standard).not.toBeCalled();
		expect(custom).toBeCalled();
	});
	it('ignoring proxy', () => {
		const proxy = new DummyProxy(createPxth(['asdf']));
		const standard = jest.fn();
		const custom = jest.fn();
		intercept(proxy, createPxth(['basdf.hello.wy']), standard, custom, []);
		expect(standard).toBeCalled();
		expect(custom).not.toBeCalled();
	});
});

describe('proxy', () => {
	it('should call proxy functions', () => {
		const proxy = new DummyProxy(createPxth(['dest']));

		const watch: jest.Mock<any, any> = jest.fn(() => () => {});
		const setValue = jest.fn();
		const getValue = jest.fn();

		proxy.watch = watch;
		proxy.setValue = setValue;
		proxy.getValue = getValue;
		proxy.activate();
		const { result } = renderUseInterceptorsHook(proxy);

		const observer = jest.fn();

		act(() => {
			const cleanup = result.current.watch(createPxth(['dest']), observer);
			const cleanup2 = result.current.watch(createPxth(['asdf']), observer);
			result.current.setValue(createPxth(['dest']), 'asdf');
			result.current.setValue(createPxth(['asdf']), 'asdf');
			cleanup();
			result.current.getValue(createPxth(['dest']));
			result.current.getValue(createPxth(['asdf']));
			cleanup2();
		});

		expect(getPxthSegments(watch.mock.calls[0][0])).toStrictEqual(['dest']);
		expect(watch).toBeCalledWith(expect.anything(), observer, expect.any(Function));
		expect(watch).toBeCalledTimes(1);
		expect(getPxthSegments(setValue.mock.calls[0][0])).toStrictEqual(['dest']);
		expect(setValue).toBeCalledWith(expect.anything(), 'asdf', expect.any(Function));
		expect(setValue).toBeCalledTimes(1);
		expect(getPxthSegments(getValue.mock.calls[0][0])).toStrictEqual(['dest']);
		expect(getValue).toBeCalledTimes(1);
	});

	it('should handle setValues / getValues properly', () => {
		const proxy = new DummyProxy(createPxth(['dest']));

		const watch = jest.fn(() => () => {});
		const setValue = jest.fn();
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const getValue = jest.fn((_path: Pxth<unknown>) => 'Test get value');

		proxy.watch = watch;
		proxy.setValue = setValue;
		proxy.getValue = getValue as <V>(path: Pxth<V>, defaultGetValue: <U>(path: Pxth<U>) => U) => V;
		proxy.activate();
		const { result } = renderUseInterceptorsHook(proxy);

		let values: any = {};

		act(() => {
			result.current.setValues({
				hello: 'asdf',
				dest: {
					bye: '',
					l: 15,
				},
			});

			values = result.current.getValues();
		});

		expect(getPxthSegments(setValue.mock.calls[0][0])).toStrictEqual(['dest']);
		expect(setValue).toBeCalledTimes(1);

		expect(getPxthSegments(getValue.mock.calls[0][0])).toStrictEqual(['dest']);
		expect(getValue).toBeCalledTimes(1);

		expect(values).toStrictEqual({
			hello: 'asdf',
			dest: 'Test get value',
		});
	});
});
