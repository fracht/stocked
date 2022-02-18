import { Pxth } from 'pxth';

import { hashPxth } from '../utils/hashPxth';

export class ProxyMap {
    private values: Record<string, Pxth<unknown>> = {};
    private keys: Record<string, Pxth<unknown>> = {};

    public get = <V>(path: Pxth<V>) => {
        return this.values[hashPxth(path)];
    };

    public set = <V>(key: Pxth<V>, value: Pxth<V>) => {
        const stingifiedKey = hashPxth(key);
        this.values[stingifiedKey] = value as Pxth<unknown>;
        this.keys[stingifiedKey] = key as Pxth<unknown>;
    };

    public has = <V>(path: Pxth<V>) => {
        return hashPxth(path) in this.values;
    };

    public entries = (): Array<[key: Pxth<unknown>, value: Pxth<unknown>]> =>
        Object.entries(this.keys).map(([key, value]) => [value, this.values[key]]);
}
