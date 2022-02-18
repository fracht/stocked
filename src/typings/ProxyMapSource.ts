import { Pxth } from 'pxth';

export type ObjectMappingType<T> = {
    [P in keyof T]?: ProxyMapSource<T[P] extends unknown[] ? T[P][0] : T[P]>;
};

export type ProxyMapSource<T> = Extract<T, string | number | Date | boolean | null> extends never
    ? ObjectMappingType<T> | Pxth<unknown>
    : Pxth<unknown>;
