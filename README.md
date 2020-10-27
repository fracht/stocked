# stocked

[![npm version](https://img.shields.io/npm/v/stocked)](https://www.npmjs.com/package/stocked)
[![npm downloads](https://img.shields.io/npm/dw/stocked)](https://www.npmjs.com/package/stocked)
[![vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/stocked)](https://www.npmjs.com/package/stocked)
[![gzipped size](https://img.badgesize.io/https:/unpkg.com/stocked/dist/stocked.cjs.production.min.js?compression=gzip)](https://unpkg.com/stocked/dist/stocked.cjs.production.min.js)

> Tiny state management library for react.

:warning: Currently this library is not ready for production. :warning:

## Installation

```bash
npm i stocked
```

## What is this

This is tiny state management library, inspired by [Recoil](https://github.com/facebookexperimental/Recoil).

## The problem

If you need to share state between your components, you'll face the performance issue. Saving all your app state into context isn't good solution, because changing value causes whole app rerender.

## The solution

"Stocked" adds a little functionality for handling global state. Changing this state not rerenders all your app, it rerenders only components, which use it.

## How to use

Wrap your app into `StockRoot` component. To access stock variable, use `useStockValue` hook. If you want to change variable, use `useStockState` hook, which is similar to standard React's `useState` hook.

## Basic usage

```tsx
import React from 'react';
import { StockRoot, useStockState } from 'stocked';

const initialValues = {
    testValue: 'asdf',
};

const StockInput = () => {
    const [value, setValue] = useStockState('hello');

    return <input value={value} onChange={e => setValue(e.target.value)} />;
};

const App = () => (
    <StockRoot initialValues={initialValues}>
        <div>
            <StockInput />
        </div>
    </StockRoot>
);
```

## How it works?

"Stocked" saves all values into React reference. As we know, changing value inside React reference not enforces component re-render. But why we can still get actual values? Because you can observe value change. So, what `useStockValue` hook does, it just subscribes to value changes, and when value will change, it will change it's own state, what will force component to rerender.

## Limitations

StockRoot supports only 1 stock. This means, that when you use `useStockState` hook, it will take stock from nearest parent context. To use few stocks at the same time, we suggest to create your own `StockRoot`:

```tsx
/* Declare types for your stock values */

type Stock1Values = {
    test: string;
    test2: string;
};

type Stock2Values = {
    example: string;
    nested: {
        value: number;
    };
};

/* Declare type for your context */

type MyStockContextType = {
    stock1: Stock<Stock1Values>;
    stock2: Stock<Stock2Values>;
};

/* Create context */

const MyStockContext = React.createContext<any>({});

/* Create your custom StockRoot */

type MyStockRootProps = {
    initialValues1: Stock1Values;
    initialValues2: Stock2Values;
    children?: React.ReactNode;
};

const MyStockRoot = ({ initialValues1, initialValues2, children }: MyStockRootProps) => {
    const stock1 = useStock({ initialValues: initialValues1 });
    const stock2 = useStock({ initialValues: initialValues2 });

    return <MyStockContext.Provider value={{ stock1, stock2 }}>{children}</MyStockContext.Provider>;
};

/* Use value from stock */

const ExampleComponent = () => {
    const { stock1 } = React.useContext(MyStockContext);
    const { stock2 } = React.useContext(MyStockContext);

    /* works the same as before, just with custom-stock provided */
    const valueFromFirstStock = useStockValue('test', stock1);
    const valueFromSecondStock = useStockValue('example', stock2);

    return (
        <div>
            {valueFromFirstStock}/{valueFromSecondStock}
        </div>
    );
};

/* Or, use stock state state */

const ExampleStateComponent = () => {
    const { stock1 } = React.useContext(MyStockContext);
    const { stock2 } = React.useContext(MyStockContext);

    /* works the same as before, just with custom-stock provided */
    const [valueFromFirstStock, setFirstValue] = useStockState('test', stock1);
    const [valueFromSecondStock, setSecondValue] = useStockState('example', stock2);

    return (
        <div>
            {valueFromFirstStock}/{valueFromSecondStock}
        </div>
    );
};
```

## API

### StockRoot

The main component, which should wrap all code, which uses stock values.
Creates stock and puts it in `StockContext`.

#### Props

| Name          | Type   | Default | Description          |
| ------------- | ------ | ------- | -------------------- |
| initialValues | object |         | Initial stock values |

### useStockContext

Hook, returns `Stock` object from Context or throws error, if used outside `StockContext`.

### useStock

Hook, returns new `Stock` object.

#### Parameters

| Name          | Type   | Default | Description          |
| ------------- | ------ | ------- | -------------------- |
| initialValues | object |         | Initial stock values |

### useStockState

Hook, returns tuple of value and value set action.
Returns _actual_ value.
This means, this hook fires re-render each time value in stock was changed.
Similar to standard React's `useState` hook.

#### Parameters

| Name  | Type    | Default   | Description                                                                                      |
| ----- | ------- | --------- | ------------------------------------------------------------------------------------------------ |
| path  | string  |           | Path to variable in stock, deeply gets value. [Explanation](https://lodash.com/docs/4.17.15#get) |
| stock | `Stock` | undefined | Optional parameter, if you want to work with custom stock, not received from context.            |

#### Returns

`[value: V, set: (value: V) => void]`

### useStockValue

Hook, which returns _actual_ stock value.
This means, it will update component each time when value in stock changes.

#### Parameters

| Name  | Type    | Default   | Description                                                                                      |
| ----- | ------- | --------- | ------------------------------------------------------------------------------------------------ |
| path  | string  |           | Path to variable in stock, deeply gets value. [Explanation](https://lodash.com/docs/4.17.15#get) |
| stock | `Stock` | undefined | optional parameter, if you want to work with custom stock, not received from context.            |

#### Returns

`value: V`

### Stock

Object, containing values and function to work with stock

#### Properties

| Name          | Type                                               | Default | Description                                                       |
| ------------- | -------------------------------------------------- | ------- | ----------------------------------------------------------------- |
| values        | `Readonly<React.MutableRefObject<T>>`              |         | Reference to actual values[^1]                                    |
| observe       | `<V>(path: string, observer: Observer<V>) => void` |         | Register observer, which will be called when variable was updated |
| stopObserving | `<V>(path: string, observer: Observer<V>) => void` |         | Remove observer                                                   |
| setValue      | `(path: string, value: unknown) => void`           |         | Set stock value                                                   |
| setValues     | `(values: T) => void`                              |         | Set all stock values                                              |
| isObserved    | `(path: string) => boolean`                        |         | Returns, if value is observed or not                              |

[^1]: **WARN:** do not try to mutate those values, or use them for display.

For changing value use `setValue` and `setValues` instead.
For accessing variable use `useStockValue` or `useStockState` or, if you want to provide custom logic, subscribe to changes via `observe` and remember to do cleanup via `stopObserving`.
Why it is so complicated? Because of performance issues, stock not updates directly
values, what will cause whole app re-render. Instead, it uses observers to re-render only necessary parts.

### Observer

Function, callen when value was changed.

#### Type

`type Observer<V> = (message: V) => void`
