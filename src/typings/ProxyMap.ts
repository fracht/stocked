import { Pxth } from 'pxth';

export type ObjectMappingType<T> = {
    [P in keyof T]?: T[P] extends unknown[] ? ArrayMappingType<T[P]> : ProxyMap<T[P]>;
};

export type ArrayMappingType<T extends unknown[]> = (index: number) => ObjectMappingType<T[0]>;

export type ProxyMap<T> = Extract<T, string | number | Date | boolean | null> extends never
    ? ObjectMappingType<T> | Pxth<unknown>
    : Pxth<unknown>;
