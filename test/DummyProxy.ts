import { Pxth } from 'pxth';

import { StockProxy } from '../src/typings/StockProxy';

export class DummyProxy extends StockProxy<unknown> {
	public getProxiedPath = <V>(path: Pxth<V>) => path;
	public getNormalPath = <V>(path: Pxth<V>) => path;
	public setValue = () => {};
	public watch = () => () => {};
	public watchEffect = () => () => {};
	public getValue = <V>(path: Pxth<V>, defaultGetValue: <U>(path: Pxth<U>) => U) => defaultGetValue(path) as V;
}
