import { Pxth } from 'pxth';

type ObjectMappingType<T> = {
    [P in keyof T]?: ProxyMap<T[P] extends unknown[] ? T[P][0] : T[P]>;
};

export type ProxyMap<T> = Extract<T, string | number | Date | boolean | null> extends never
    ? ObjectMappingType<T> | Pxth<unknown>
    : Pxth<unknown>;
