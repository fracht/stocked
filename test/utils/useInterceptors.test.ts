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
            const cleanup = result.current.watch('hello', observer);
            result.current.setValue('hello', 'asdf');
            cleanup();
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

        const watch = jest.fn(() => () => {});
        const setValue = jest.fn();
        const getValue = jest.fn();

        proxy.watch = watch;
        proxy.setValue = setValue;
        proxy.getValue = getValue;
        proxy.activate();
        const { result } = renderUseInterceptorsHook(proxy);

        const observer = jest.fn();

        act(() => {
            const cleanup = result.current.watch('dest', observer);
            const cleanup2 = result.current.watch('asdf', observer);
            result.current.setValue('dest', 'asdf');
            result.current.setValue('asdf', 'asdf');
            cleanup();
            result.current.getValue('dest');
            result.current.getValue('asdf');
            cleanup2();
        });

        expect(watch).toBeCalledWith('dest', observer, expect.any(Function));
        expect(watch).toBeCalledTimes(1);
        expect(setValue).toBeCalledWith('dest', 'asdf', expect.any(Function));
        expect(setValue).toBeCalledTimes(1);
        expect(getValue).toBeCalledWith('dest', expect.any(Function));
        expect(getValue).toBeCalledTimes(1);
    });
});
