import { ROOT_PATH } from '../src/hooks';
import { StockProxy } from '../src/typings/StockProxy';

export class DummyProxy extends StockProxy {
    public getProxiedPath = (path: string | typeof ROOT_PATH) => path;
    public getNormalPath = (path: string | typeof ROOT_PATH) => path;
    public setValue = () => {};
    public watch = () => () => {};
    public getValue = <V>(
        path: string | typeof ROOT_PATH,
        defaultGetValue: (path: string | typeof ROOT_PATH) => unknown
    ) => defaultGetValue(path) as V;
}
