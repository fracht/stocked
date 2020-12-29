import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Stock, StockRoot, useStockContext } from '../../src';

let container: HTMLDivElement | null = null;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
});

afterEach(() => {
    if (container) {
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    }
});

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

        act(() => {
            render(
                <StockRoot initialValues={initialValues}>
                    <div>
                        <h2>Test component</h2>
                        <p>other component</p>
                        <StockExtractor logStock={stock => (realValues = stock.getValues())} />
                    </div>
                </StockRoot>,
                container
            );
        });

        expect(realValues).toStrictEqual(initialValues);
    });
});

describe('StockRoot performance testing', () => {
    it('should never rerender StockRoot', () => {
        const RerenderCounter: React.FC = jest.fn(() => <div />);

        act(() => {
            let stock: Stock<object> | undefined = undefined;

            render(
                <StockRoot initialValues={{}}>
                    <RerenderCounter />
                    <StockExtractor logStock={_stock => (stock = _stock)} />
                </StockRoot>,
                container
            );

            if (stock) {
                const _stock = stock as any;
                _stock.setValue('hello', 'asdf');
                _stock.setValue('nested.value', 3);
                _stock.setValue('asdfasd.asdf.asdf', 'asdf');
            }
        });

        expect(RerenderCounter).toBeCalledTimes(1);
    });
});
