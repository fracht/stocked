import { StockProxy } from '../src/typings/StockProxy';

export class DummyProxy extends StockProxy {
    public setValue = () => {};
    public watch = () => () => {};
    public getValue = <V>(path: string, defaultGetValue: (path: string) => unknown) => defaultGetValue(path) as V;
}
