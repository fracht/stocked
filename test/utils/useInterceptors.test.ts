import { act, renderHook, waitFor } from '@testing-library/react';
import { createPxth, getPxthSegments, Pxth } from 'pxth';

import { MappingProxy, Stock, StockProxy, useStock } from '../../src';
import { intercept, useInterceptors } from '../../src/utils/useInterceptors';
import { DummyProxy } from '../DummyProxy';

const defaultInitialValues = {
	hello: '',
	dest: {
		bye: 'asdf',
		l: 0,
	},
};

const renderUseInterceptorsHook = <T extends object>(initialValues: T, proxy?: StockProxy<unknown>) => {
	const { result } = renderHook(() => useStock({ initialValues }));

	const stock = result.current;
	return [renderHook(() => useInterceptors(stock, proxy)), stock] as const;
};

describe('hit cases', () => {
	it('no proxy', () => {
		const [{ result }] = renderUseInterceptorsHook(defaultInitialValues);

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
		expect(() => renderUseInterceptorsHook(defaultInitialValues, new DummyProxy(createPxth(['asdf'])))).toThrow();
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
		const [{ result }] = renderUseInterceptorsHook(defaultInitialValues, proxy);

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
		expect(watch).toBeCalledWith(expect.anything(), observer, expect.anything());
		expect(watch).toBeCalledTimes(1);
		expect(getPxthSegments(setValue.mock.calls[0][0])).toStrictEqual(['dest']);
		expect(setValue).toBeCalledWith(expect.anything(), 'asdf', expect.anything());
		expect(setValue).toBeCalledTimes(1);
		expect(getPxthSegments(getValue.mock.calls[0][0])).toStrictEqual(['dest']);
		expect(getValue).toBeCalledTimes(1);
	});

	it('should handle setValues / getValues properly', async () => {
		const proxy = new DummyProxy(createPxth(['dest']));

		const watch = jest.fn(() => () => {});
		const setValue = jest.fn();
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const getValue = jest.fn((_path: Pxth<unknown>) => 'Test get value');

		proxy.watch = watch;
		proxy.setValue = setValue;
		proxy.getValue = getValue as <V>(path: Pxth<V>, stock: Stock<any>) => V;
		proxy.activate();
		const [{ result }] = renderUseInterceptorsHook(defaultInitialValues, proxy);

		result.current.setValues({
			hello: 'asdf',
			dest: {
				bye: '',
				l: 15,
			},
		});

		await waitFor(() =>
			expect(result.current.getValues()).toStrictEqual({
				hello: 'asdf',
				dest: 'Test get value',
			}),
		);

		expect(getPxthSegments(setValue.mock.calls[0][0])).toStrictEqual(['dest']);
		expect(setValue).toBeCalledTimes(1);

		expect(getPxthSegments(getValue.mock.calls[0][0])).toStrictEqual(['dest']);
		expect(getValue).toBeCalledTimes(1);
	});

	it('should set entire values object', async () => {
		const initialValues = {
			userName: 'Harry',
			userSurname: 'Potter',
		};

		const proxy = new MappingProxy(
			{
				driver: {
					name: createPxth<string>(['userName']),
					surname: createPxth<string>(['userSurname']),
				},
			},
			createPxth<{ driver: { name: string; surname: string } }>(['proxy']),
		);

		proxy.activate();

		const [{ result }, realStock] = renderUseInterceptorsHook(initialValues, proxy);

		const proxiedStock = result.current;

		proxiedStock.setValues({
			proxy: {
				driver: {
					name: 'John',
					surname: 'Weasley',
				},
			},
			userName: 'THIS SHOULD BE OVERRIDED',
			userSurname: 'THIS SHOULD BE OVERRIDED',
		} as typeof initialValues);

		await waitFor(() => {
			expect(proxiedStock.getValues()).toStrictEqual({
				proxy: {
					driver: {
						name: 'John',
						surname: 'Weasley',
					},
				},
				userName: 'John',
				userSurname: 'Weasley',
			});

			expect(realStock.getValues()).toStrictEqual({
				userName: 'John',
				userSurname: 'Weasley',
			});
		});
	});

	it('should be able to pass an update callback to construct new state', async () => {
		const initialValues = {
			userName: 'Harry',
			userSurname: 'Potter',
		};

		const proxy = new MappingProxy(
			{
				driver: {
					name: createPxth<string>(['userName']),
					surname: createPxth<string>(['userSurname']),
				},
			},
			createPxth<{ driver: { name: string; surname: string } }>(['proxy']),
		);

		proxy.activate();

		const [{ result }, realStock] = renderUseInterceptorsHook(initialValues, proxy);

		const proxiedStock = result.current;

		const valuePath = createPxth<string>(['proxy', 'driver', 'name']);
		proxiedStock.setValue(valuePath, (old) => old + ' updated');

		await waitFor(() => {
			expect(proxiedStock.getValue(valuePath)).toBe('Harry updated');
			expect(realStock.getValue(createPxth<string>(['userName']))).toBe('Harry updated');
		});
	});
});
