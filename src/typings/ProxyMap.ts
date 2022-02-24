import { Pxth } from 'pxth';

import { hashPxth } from '../utils/hashPxth';

export class ProxyMap {
    private values: Record<string, Pxth<unknown>> = {};
    private keys: Record<string, Pxth<unknown>> = {};

    public get = <V>(key: Pxth<V>) => {
        return this.values[hashPxth(key)];
    };

    public set = <V>(key: Pxth<V>, value: Pxth<V>) => {
        const stingifiedKey = hashPxth(key);
        this.values[stingifiedKey] = value as Pxth<unknown>;
        this.keys[stingifiedKey] = key as Pxth<unknown>;
    };

    public has = <V>(key: Pxth<V>) => {
        return hashPxth(key) in this.values;
    };

    public entries = (): Array<[Pxth<unknown>, Pxth<unknown>]> =>
        Object.entries(this.keys).map(([key, value]) => [value, this.values[key]]);
}
