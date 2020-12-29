import { act, renderHook } from '@testing-library/react-hooks';
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

const renderUseInterceptorsHook = (proxy?: StockProxy) => renderHook(() => useInterceptors(stock!, proxy));

beforeEach(() => {
    const { result } = renderHook(() => useStock({ initialValues }));

    stock = result.current;
});

describe('hit cases', () => {
    it('no proxy', () => {
        const { result } = renderUseInterceptorsHook();

        const observer = jest.fn();
        act(() => {
            const key = result.current.observe('hello', observer);
            result.current.setValue('hello', 'asdf');
            result.current.stopObserving('hello', key);
            result.current.setValue('hello', 'ba');
        });

        expect(observer).toBeCalledTimes(1);
        expect(observer).toBeCalledWith('asdf');
    });
    it('non activated proxy', () => {
        // expect(() => renderUseInterceptorsHook(new DummyProxy('asdf'))).toThrowError();
    });
});

describe('intercept', () => {
    it('no proxy', () => {
        const standard = jest.fn();
        const custom = jest.fn();
        intercept(undefined, '', standard, custom, []);
        expect(standard).toBeCalled();
        expect(custom).not.toBeCalled();
    });
    it('proxy', () => {
        const proxy = new DummyProxy('asdf');
        const standard = jest.fn();
        const custom = jest.fn();
        intercept(proxy, 'asdf', standard, custom, []);
        expect(standard).not.toBeCalled();
        expect(custom).toBeCalled();
    });
    it('proxy (nested interception)', () => {
        const proxy = new DummyProxy('asdf');
        const standard = jest.fn();
        const custom = jest.fn();
        intercept(proxy, 'asdf.hello.b', standard, custom, []);
        expect(standard).not.toBeCalled();
        expect(custom).toBeCalled();
    });
    it('ignoring proxy', () => {
        const proxy = new DummyProxy('asdf');
        const standard = jest.fn();
        const custom = jest.fn();
        intercept(proxy, 'basdf.hello.wy', standard, custom, []);
        expect(standard).toBeCalled();
        expect(custom).not.toBeCalled();
    });
});

describe('proxy', () => {
    it('should call proxy functions', () => {
        const proxy = new DummyProxy('dest');

        const observe = jest.fn(() => 0);
        const stopObserving = jest.fn();
        const setValue = jest.fn();
        const getValue = jest.fn();

        proxy.observe = observe;
        proxy.stopObserving = stopObserving;
        proxy.setValue = setValue;
        proxy.getValue = getValue;
        proxy.activate();
        const { result } = renderUseInterceptorsHook(proxy);

        const observer = jest.fn();

        act(() => {
            const key = result.current.observe('dest', observer);
            const key2 = result.current.observe('asdf', observer);
            result.current.setValue('dest', 'asdf');
            result.current.setValue('asdf', 'asdf');
            result.current.stopObserving('dest', key);
            result.current.getValue('dest');
            result.current.getValue('asdf');
            result.current.stopObserving('asdf', key2);
        });

        expect(observe).toBeCalledWith('dest', observer, expect.any(Function));
        expect(observe).toBeCalledTimes(1);
        expect(stopObserving).toBeCalledWith('dest', 0, expect.any(Function));
        expect(stopObserving).toBeCalledTimes(1);
        expect(setValue).toBeCalledWith('dest', 'asdf', expect.any(Function));
        expect(setValue).toBeCalledTimes(1);
        expect(getValue).toBeCalledWith('dest', expect.any(Function));
        expect(getValue).toBeCalledTimes(1);
    });
});
