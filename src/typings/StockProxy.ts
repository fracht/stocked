import { SetStateAction } from 'react';
import { Pxth } from 'pxth';

import { Observer } from './Observer';

/**
 * Abstract class of "stocked" proxy
 * By inheriting this class, you can provide custom logic for proxing (casting) values.
 */
export abstract class StockProxy<T> {
	/** Path to variable, where proxy is attached. */
	public readonly path: Pxth<T>;

	public constructor(path: Pxth<T>) {
		this.path = path;
	}

	/** Function, which sets proxied value. It will be callen only if proxied value is changing. */
	public abstract setValue: <V>(
		path: Pxth<V>,
		value: SetStateAction<V>,
		defaultSetValue: <U>(path: Pxth<U>, value: SetStateAction<U>) => void,
		defaultGetValue: <U>(path: Pxth<U>) => U,
	) => void;

	/**
	 * Function for watching proxied value. Should return cleanup.
	 * @deprecated
	 */
	public abstract watch: <V>(
		path: Pxth<V>,
		observer: Observer<V>,
		defaultWatch: <U>(path: Pxth<U>, observer: Observer<U>) => () => void,
	) => () => void;

	/** Function for watching proxied value. Should return cleanup. Calls observer instantly. */
	public abstract watchEffect: <V>(
		path: Pxth<V>,
		observer: Observer<V>,
		defaultWatchEffect: <U>(path: Pxth<U>, observer: Observer<U>) => () => void,
	) => () => void;

	/** Function to access proxied value. */
	public abstract getValue: <V>(path: Pxth<V>, defaultGetValue: <U>(path: Pxth<U>) => U) => V;

	/** Function for getting proxied path from normal path. */
	public abstract getProxiedPath: <V>(path: Pxth<V>) => Pxth<V>;

	/** Function for getting normal path from proxied path */
	public abstract getNormalPath: <V>(path: Pxth<V>) => Pxth<V>;

	/** Activate proxy. After activation, you cannot modify proxy. */
	public activate = () => Object.freeze(this);

	/** Returns boolean, is proxy active and ready for use or not. */
	public isActive = () => Object.isFrozen(this);
}
