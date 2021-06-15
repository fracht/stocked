import React, { useReducer } from 'react';
import { StockRoot, useStockState, useStockValue } from 'stocked';

const StockInput = ({ name, ...oth }: React.InputHTMLAttributes<HTMLInputElement> & { name: string }) => {
    const [value, setValue] = useStockState<string>(name);

    return <input {...oth} value={value} onChange={e => setValue(e.target.value)} />;
};

const DisplayValue = ({ name }: { name: string }) => {
    const value = useStockValue<string>(name);

    return <span>{value}</span>;
};

const AllValuesDisplayer = () => {
    // const { values } = useStockContext();

    const [, forceUpdate] = useReducer(value => value + 1, 0);

    return (
        <div>
            <button onClick={forceUpdate}>Request all values</button>
            {/* {JSON.stringify(values.current, undefined, 4)} */}
        </div>
    );
};

const initialValues = {
    hello: 'Dummy value',
};

export const StockExample = () => (
    <StockRoot initialValues={initialValues}>
        <h1>Hello world example!</h1>
        <div>
            <label htmlFor="hello">This is simple input: </label>
            <StockInput id="hello" name="hello" />
        </div>
        <div>
            <span>Which not rerenders whole app:</span>
            <DisplayValue name="hello" />
        </div>
        <div>But you still can access all values:</div>
        <AllValuesDisplayer />
    </StockRoot>
);
