import { Pxth } from 'pxth';

/** Object, in which "stocked" calls observers */
export type BatchUpdate<T> = {
	/** which paths should be updated */
	paths: Pxth<unknown>[];
	/** path, which triggered subtree update */
	origin: Pxth<unknown>;
	/** all values, which should be sent to observers */
	values: T;
};
