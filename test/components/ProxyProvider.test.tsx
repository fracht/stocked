import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';

import { MappingProxy, ProxyProvider, Stock, StockRoot, useStockContext } from '../../src';

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

const StockExtractor = ({ extract }: { extract: (stock: Stock<object>) => void }) => {
    const stock = useStockContext();

    extract(stock);

    return <div />;
};

describe('ProxyProvider', () => {
    it('should provide proxy', () => {
        const proxy = new MappingProxy(
            {
                surname: 'user.name',
            },
            'user'
        );

        proxy.activate();

        let stock: Stock<object> | undefined = undefined;

        act(() => {
            render(
                <StockRoot initialValues={{ user: { name: 'hello' } }}>
                    <ProxyProvider proxy={proxy}>
                        <StockExtractor extract={value => (stock = value)} />
                    </ProxyProvider>
                </StockRoot>,
                container
            );
        });

        expect(stock!.getValue('user')).toStrictEqual({
            surname: 'hello',
        });
    });

    it('should handle nested proxies', () => {
        const proxy = new MappingProxy(
            {
                surname: 'user.name',
            },
            'user'
        );

        const proxy2 = new MappingProxy(
            {
                'name.surname': 'user.surname',
            },
            'user'
        );

        proxy.activate();
        proxy2.activate();

        let stock: Stock<object> | undefined = undefined;

        act(() => {
            render(
                <StockRoot initialValues={{ user: { name: 'hello' } }}>
                    <ProxyProvider proxy={proxy}>
                        <ProxyProvider proxy={proxy2}>
                            <StockExtractor extract={value => (stock = value)} />
                        </ProxyProvider>
                    </ProxyProvider>
                </StockRoot>,
                container
            );
        });

        expect(stock!.getValue('user')).toStrictEqual({
            name: {
                surname: 'hello',
            },
        });
    });
});
