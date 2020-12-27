import { StockConfig, useStock } from '../../src';
import { renderHook, act } from '@testing-library/react-hooks';

const renderUseStockHook = (initialValues: object) =>
    renderHook((props: StockConfig<object>) => useStock(props), {
        initialProps: { initialValues },
    });

describe('Value setting and getting', () => {
    it('should not mutate initial values', () => {
        const testDateValue = new Date();
        const initialValues = {
            first: 'a',
            second: 'b',
            nested: {
                value: 'c',
            },
            array: [
                {
                    prop1: 15,
                },
                {
                    prop2: testDateValue,
                },
            ],
        };

        const { result } = renderUseStockHook(initialValues);

        act(() => {
            result.current.setValue('first', 'b');
            result.current.setValue('nested.value', 'b');
            result.current.setValue('array[0].prop1', 'b');
        });

        expect(initialValues).toStrictEqual({
            first: 'a',
            second: 'b',
            nested: {
                value: 'c',
            },
            array: [
                {
                    prop1: 15,
                },
                {
                    prop2: testDateValue,
                },
            ],
        });
    });

    it('should set value', () => {
        const { result } = renderUseStockHook({
            first: 'a',
            second: 'b',
        });

        act(() => {
            result.current.setValue('first', 'test');
        });

        expect(result.current.values.current).toStrictEqual({
            first: 'test',
            second: 'b',
        });

        act(() => {
            result.current.setValue('second', 0);
        });

        expect(result.current.values.current).toStrictEqual({
            first: 'test',
            second: 0,
        });
    });

    it('should set value via updater function', () => {
        const { result } = renderUseStockHook({
            first: 'a',
            second: {
                third: 'b',
            },
        });

        act(() => {
            result.current.setValue('first', (prevValue: string) => prevValue + 'b');
        });

        expect(result.current.values.current).toStrictEqual({
            first: 'ab',
            second: {
                third: 'b',
            },
        });

        act(() => {
            result.current.setValue('second', (prevValue: object) => ({ ...prevValue, new: 5 }));
        });

        expect(result.current.values.current).toStrictEqual({
            first: 'ab',
            second: {
                third: 'b',
                new: 5,
            },
        });
    });

    it('should set nested value', () => {
        const { result } = renderUseStockHook({
            nested: {
                value: 'a',
                second: {
                    value: 'b',
                    third: {
                        fourth: 'c',
                    },
                },
            },
        });

        act(() => {
            result.current.setValue('nested.value', 'b');
        });

        expect(result.current.values.current).toStrictEqual({
            nested: {
                value: 'b',
                second: {
                    value: 'b',
                    third: {
                        fourth: 'c',
                    },
                },
            },
        });

        act(() => {
            result.current.setValue('nested.second.value', 'c');
        });

        expect(result.current.values.current).toStrictEqual({
            nested: {
                value: 'b',
                second: {
                    value: 'c',
                    third: {
                        fourth: 'c',
                    },
                },
            },
        });

        act(() => {
            result.current.setValue('nested.second.third.fourth', 'd');
        });

        expect(result.current.values.current).toStrictEqual({
            nested: {
                value: 'b',
                second: {
                    value: 'c',
                    third: {
                        fourth: 'd',
                    },
                },
            },
        });

        act(() => {
            result.current.setValue('nested.second', { value: 'd', third: { fourth: 'e' } });
        });

        expect(result.current.values.current).toStrictEqual({
            nested: {
                value: 'b',
                second: {
                    value: 'd',
                    third: {
                        fourth: 'e',
                    },
                },
            },
        });
    });

    it('should set array value', () => {
        const { result } = renderUseStockHook({
            arr: [
                {
                    p1: 'a',
                },
                {
                    p2: 'b',
                },
            ],
        });

        act(() => {
            result.current.setValue('arr[0].p1', 0);
        });

        expect(result.current.values.current).toStrictEqual({
            arr: [
                {
                    p1: 0,
                },
                {
                    p2: 'b',
                },
            ],
        });

        act(() => {
            result.current.setValue('arr.1.p2', null);
        });

        expect(result.current.values.current).toStrictEqual({
            arr: [
                {
                    p1: 0,
                },
                {
                    p2: null,
                },
            ],
        });
    });

    it('should send array to observers', () => {
        const { result } = renderUseStockHook({
            arr: ['val1', 'val2'],
        });

        const observer = jest.fn();

        const newValues = ['val3', 'val4'];

        act(() => {
            result.current.observe('arr', observer);
            result.current.setValue('arr', newValues);
        });

        expect(observer.mock.calls[0][0]).toStrictEqual(newValues);
    });

    it('should set all values', () => {
        const { result } = renderUseStockHook({});

        act(() => {
            result.current.setValues({
                hello: 'asdf',
                b: {
                    c: 0,
                },
            });
        });

        expect(result.current.values.current).toStrictEqual({
            hello: 'asdf',
            b: {
                c: 0,
            },
        });
    });

    it('should reset values to initial', () => {
        const initialValues = {
            first: 'a',
            second: {
                third: 'b',
            },
        };

        const observer = jest.fn();

        const { result } = renderUseStockHook(initialValues);

        act(() => {
            result.current.observe('second', observer);
            result.current.setValue('second', { third: 'new' });
            result.current.resetValues();
        });

        expect(result.current.values.current).toStrictEqual(initialValues);
        expect(observer.mock.calls[1][0]).toStrictEqual({
            third: 'b',
        });
    });
});

describe('Batch observers tests', () => {
    it('should call observer', () => {
        const { result } = renderUseStockHook({
            value: 'asdf',
        });

        const observer = jest.fn();

        act(() => {
            result.current.observeBatchUpdates(observer);

            result.current.setValue('value', '2');
        });

        expect(observer).toBeCalled();
    });

    it('should call observer on any update with arguments', () => {
        const { result } = renderUseStockHook({
            value: 'asdf',
            parent: {
                child: {
                    hello: 'asdf',
                },
            },
        });

        const observer = jest.fn();

        act(() => {
            result.current.observeBatchUpdates(observer);
            result.current.observe('parent.child', jest.fn());
            result.current.observe('parent', jest.fn());
            result.current.observe('value', jest.fn());

            result.current.setValue('parent.child.hello', '2');
        });

        expect(observer).toBeCalled();
        expect(observer).toBeCalledWith({
            paths: ['parent.child', 'parent'],
            values: {
                value: 'asdf',
                parent: {
                    child: {
                        hello: '2',
                    },
                },
            },
        });
    });

    it('should remove observer', () => {
        const { result } = renderUseStockHook({
            value: 'asdf',
        });

        const observer = jest.fn();

        act(() => {
            const key = result.current.observeBatchUpdates(observer);

            result.current.setValue('value', '2');

            result.current.stopObservingBatchUpdates(key);

            result.current.setValue('value', 'h');
        });

        expect(observer).toBeCalledTimes(1);
    });
});
