import { MutableRefObject, useRef } from 'react';

/**
 * Same as `React.useRef` but with lazy initialization.
 * @param initializer - function, which initializes value. Called once.
 */
export const useLazyRef = <T>(initializer: () => T): MutableRefObject<T> => {
	const ref = useRef<T | null>(null);

	if (ref.current === null) {
		ref.current = initializer();
	}

	return ref as MutableRefObject<T>;
};
