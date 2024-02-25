import { Pxth } from 'pxth';

import { hashPxth } from '../utils/hashPxth';

export class PxthMap<Value> {
	private _values: Record<string, Value> = {};
	private _keys: Record<string, Pxth<unknown>> = {};

	public get = <V>(key: Pxth<V>): Value | undefined => {
		return this._values[hashPxth(key)];
	};

	public set = <V>(key: Pxth<V>, value: Value) => {
		const stingifiedKey = hashPxth(key);
		this._values[stingifiedKey] = value;
		this._keys[stingifiedKey] = key as Pxth<unknown>;
	};

	public remove = <V>(key: Pxth<V>) => {
		const stingifiedKey = hashPxth(key);
		delete this._values[stingifiedKey];
		delete this._keys[stingifiedKey];
	};

	public has = <V>(key: Pxth<V>) => {
		return hashPxth(key) in this._values;
	};

	public keys = (): Pxth<unknown>[] => Object.values(this._keys);

	public entries = (): Array<[key: Pxth<unknown>, value: Value]> =>
		Object.entries(this._keys).map(([key, value]) => [value, this._values[key]]);
}
