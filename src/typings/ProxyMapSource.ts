import { Pxth } from 'pxth';

type Primitive = string | number | boolean | bigint | symbol | null | undefined;

type ObjectMappingType<T> = {
	[P in keyof T]: ProxyMapSource<T[P]>;
};

export type ProxyMapSource<T> = T extends Primitive ? Pxth<T> : ObjectMappingType<T> | Pxth<T>;
