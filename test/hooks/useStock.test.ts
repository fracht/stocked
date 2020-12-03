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
});

describe('Observer tests', () => {
    it('should call value observer', () => {
        const initialValues = {
            b: 'hello',
        };

        const { result } = renderUseStockHook(initialValues);

        const observer = jest.fn();

        act(() => {
            result.current.observe('b', observer);
            result.current.setValue('b', 'asdf');
        });

        expect(observer).toBeCalled();
    });

    it('should call parent observer', () => {
        const { result } = renderUseStockHook({
            parent: {
                child: 'value',
            },
        });

        const object = jest.fn();

        act(() => {
            result.current.observe('parent', object);
            result.current.setValue('parent.child', 'b');
        });

        expect(object).toBeCalled();
    });

    it('should call child observer', () => {
        const { result } = renderUseStockHook({
            parent: {
                child: 'value',
            },
        });

        const observer = jest.fn();

        act(() => {
            result.current.observe('parent.child', observer);
            result.current.setValue('parent', { child: 'b' });
        });

        expect(observer).toBeCalled();
    });

    it('should call tree branch of observers', () => {
        const { result } = renderUseStockHook({
            parent: {
                child: {
                    value: 'asdf',
                },
            },
        });

        const observer = jest.fn();

        act(() => {
            result.current.observe('parent', observer);
            result.current.observe('parent.child', observer);
            result.current.observe('parent.child.value', observer);
            result.current.setValue('parent.child.value', 'b');
        });

        expect(observer).toBeCalledTimes(3);
    });

    it('should call all observers', () => {
        const { result } = renderUseStockHook({
            parent: {
                child: {
                    value: 'asdf',
                },
            },
        });

        const oberver = jest.fn();

        act(() => {
            result.current.observe('parent', oberver);
            result.current.observe('parent.child', oberver);
            result.current.observe('parent.child.value', oberver);
            result.current.setValues({ parent: { child: { value: 'b' } } });
        });

        expect(oberver).toBeCalledTimes(3);
    });

    it("shouldn't call observer", () => {
        const { result } = renderUseStockHook({
            parent: {
                child: {
                    value: 'asdf',
                },
                notInBranch: {
                    value: 'asdf',
                },
            },
        });

        const observer = jest.fn();

        act(() => {
            result.current.observe('parent.notInBranch', observer);
            result.current.setValue('parent.child.value', 'newValue');
        });

        expect(observer).not.toBeCalled();
    });

    it('should receive correct value', () => {
        const { result } = renderUseStockHook({});

        const value = 'hello';

        const parentObserver = jest.fn();
        const childObserver = jest.fn();

        act(() => {
            result.current.observe('parent', parentObserver);
            result.current.observe('parent.child', childObserver);
            result.current.setValue('parent.child', value);
        });

        expect(childObserver).toBeCalledWith(value);
        expect(parentObserver).toBeCalledWith({ child: value });
    });
});

describe('Is observed test', () => {
    it('should be observed', () => {
        const { result } = renderUseStockHook({
            value: 'asdf',
        });

        act(() => {
            result.current.observe('value', jest.fn());
        });

        expect(result.current.isObserved('value')).toBeTruthy();
        expect(result.current.isObserved('asdf')).toBeFalsy();
    });
    it('should be observed denormalized path', () => {
        const { result } = renderUseStockHook({
            arr: [0, 1, 2],
        });

        act(() => {
            result.current.observe('arr[0]', jest.fn());
        });

        expect(result.current.isObserved('arr[0]')).toBeTruthy();
        expect(result.current.isObserved('arr.0')).toBeTruthy();
        expect(result.current.isObserved('arr[3]')).toBeFalsy();
    });
});

describe('Removing observers test', () => {
    it('should remove observer', () => {
        const { result } = renderUseStockHook({
            value: 'asdf',
        });

        const observer = jest.fn();

        act(() => {
            const key = result.current.observe('value', observer);

            result.current.setValue('value', '2');

            result.current.stopObserving('value', key);

            result.current.setValue('value', '3');
        });

        expect(observer).toBeCalledTimes(1);
    });

    it('should remove denormalized path observer', () => {
        const { result } = renderUseStockHook({
            arr: [0, 1, 2],
        });

        const observer = jest.fn();

        act(() => {
            const key = result.current.observe('arr[0]', observer);

            result.current.setValue('arr.0', 0);
            result.current.setValue('arr[0]', 1);

            result.current.stopObserving('arr[0]', key);

            result.current.setValue('arr.0', 1);
            result.current.setValue('arr[0]', 2);
        });

        expect(observer).toBeCalledTimes(2);
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
