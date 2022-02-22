import { Pxth } from 'pxth';

type ObjectMappingType<T> = {
    [P in keyof T]: ProxyMapSource<T[P]>;
};

export type ProxyMapSource<T> = T extends string | number | boolean | null | undefined
    ? Pxth<T>
    : ObjectMappingType<T> | Pxth<T>;
