import { Pxth } from 'pxth';

import { Stock } from '../src';
import { StockProxy } from '../src/typings/StockProxy';

export class DummyProxy extends StockProxy<unknown> {
	public getProxiedPath = <V>(path: Pxth<V>) => path;
	public getNormalPath = <V>(path: Pxth<V>) => path;
	public setValue = () => {};
	public watch = () => () => {};
	public getValue = <V>(path: Pxth<V>, { getValue: defaultGetValue }: Stock<object>) => defaultGetValue(path) as V;
}
