import React from 'react';
import { useStockState, StockContext, Stock, useStock } from '../../src';
import { renderHook, act } from '@testing-library/react-hooks';

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
    <StockContext.Provider value={(stock as unknown) as Stock<object>}>{children}</StockContext.Provider>
);

const renderUseStockState = (path: string, useContext = true) =>
    renderHook(() => useStockState(path, useContext ? undefined : stock), {
        wrapper: useContext ? wrapper : undefined,
    });

beforeEach(() => {
    const { result } = renderHook(() => useStock({ initialValues }), { wrapper });
    stock = result.current;
});

const testWrapper = (testName: string, useContext: boolean) => {
    describe(testName, () => {
        it('Should set value via setter', async () => {
            const { result, waitForNextUpdate } = renderUseStockState('parent.child', useContext);

            const newValue = 'newValue';

            await act(async () => {
                const [, setValue] = result.current;
                setValue(newValue);
                await waitForNextUpdate({ timeout: 1000 });
            });

            expect(result.current[0]).toBe(newValue);
        });

        it('Should set value via updater function', async () => {
            const { result, waitForNextUpdate } = renderUseStockState('parent.child', useContext);

            await act(async () => {
                const [, setValue] = result.current;
                setValue((prevValue: string) => prevValue + '_changed_via_updater');
                await waitForNextUpdate({ timeout: 1000 });
            });

            expect(result.current[0]).toBe('value_changed_via_updater');
        });

        it('Should update when externally set value', async () => {
            const { result, waitForNextUpdate } = renderUseStockState('hello', useContext);

            expect(result.current[0]).toBe(initialValues.hello);

            const newValue = 'newValue';

            const promise = act(async () => {
                await waitForNextUpdate({ timeout: 1000 });
            });

            stock.setValue('hello', newValue);

            await promise;

            expect(result.current[0]).toBe(newValue);
        });
    });
};

testWrapper('Testing "useStockState" with context stock', true);
testWrapper('Testing "useStockState" with provided into arguments stock', false);
