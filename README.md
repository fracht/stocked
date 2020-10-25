# stocked

![](https://img.shields.io/npm/v/stocked)
![](https://img.shields.io/npm/dw/stocked)
![](https://img.shields.io/snyk/vulnerabilities/npm/stocked)

> Tiny state management app for react.

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

Stocker adds a little functionality for handling global state. Changing this state not rerenders all your app, it rerenders only components, which use it.

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

## Limitations

Wrapping StockRoot inside another StockRoot will cause a problem: you can access only 1 stock root at time.

## API

### StockRoot

Component which provides StockContext for your app.

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

Hook, returns tuple, where first value is value, second - setValue.
Similar to default React's `useState` hook.

#### Parameters

| Name  | Type    | Default   | Description                                                  |
| ----- | ------- | --------- | ------------------------------------------------------------ |
| path  | string  |           | Path to variable inside `Stock` values                       |
| stock | `Stock` | undefined | Use custom provided stock, instead of context-provided stock |

#### Returns

`[value: V, set: (value: V) => void]`

### useStockValue

Hook, returns actual value of `Stock`.

#### Parameters

| Name  | Type    | Default   | Description                                                  |
| ----- | ------- | --------- | ------------------------------------------------------------ |
| path  | string  |           | Path to variable inside `Stock` values                       |
| stock | `Stock` | undefined | Use custom provided stock, instead of context-provided stock |

#### Returns

`value: V`

### Stock

Object, containing values and function to work with stock

#### Properties

values: Readonly<MutableRefObject<T>>;
observe: <V>(path: string, observer: Observer<V>) => void;
stopObserving: <V>(path: string, observer: Observer<V>) => void;
setValue: (path: string, value: unknown) => void;
setValues: (values: T) => void;
isObserved: (path: string) => boolean;

| Name          | Type                                               | Default | Description                                                       |
| ------------- | -------------------------------------------------- | ------- | ----------------------------------------------------------------- |
| values        | `Readonly<React.MutableRefObject<T>>`              |         | Reference to actual values                                        |
| observe       | `<V>(path: string, observer: Observer<V>) => void` |         | Register observer, which will be called when variable was updated |
| stopObserving | `<V>(path: string, observer: Observer<V>) => void` |         | Remove observer                                                   |
| setValue      | `(path: string, value: unknown) => void`           |         | Set stock value                                                   |
| setValues     | `(values: T) => void`                              |         | Set all stock values                                              |
| isObserved    | `(path: string) => boolean`                        |         | Returns, if value is observed or not                              |

### Observer

Function, callen when value was changed.

#### Type

`type Observer<V> = (message: V) => void`
