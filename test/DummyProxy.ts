import { StockProxy } from '../src/typings/StockProxy';

export class DummyProxy extends StockProxy {
    public setValue = () => {};
    public observe = () => 0;
    public stopObserving = () => {};
    public getValue = <V>(path: string, defaultGetValue: (path: string) => unknown) => defaultGetValue(path) as V;
}
