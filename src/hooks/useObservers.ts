import { useCallback, useRef } from 'react';
import { createPxth, deepGet, isInnerPxth, Pxth, samePxth } from 'pxth';
import invariant from 'tiny-invariant';

import { BatchUpdate, Observer } from '../typings';
import { PxthMap } from '../typings/PxthMap';
import { ObserverArray, ObserverKey } from '../utils/ObserverArray';
import { useLazyRef } from '../utils/useLazyRef';

export type ObserversControl<T> = {
	/** Watch stock value. Returns cleanup function. */
	watch: <V>(path: Pxth<V>, observer: Observer<V>) => () => void;
	/** Watch all stock values. Returns cleanup function. */
	watchAll: (observer: Observer<T>) => () => void;
	/** Check if value is observed or not. */
	isObserved: <V>(path: Pxth<V>) => boolean;
	/** Notify all observers, which are children of specified path */
	notifySubTree: <V>(path: Pxth<V>, values: T) => void;
	/** Notify all observers */
	notifyAll: (values: T) => void;
	/** "stocked" updates values in batches, so you can subscribe to batch updates. Returns cleanup. */
	watchBatchUpdates: (observer: Observer<BatchUpdate<T>>) => () => void;
};

/** Hook, wraps functionality of observers storage (add, remove, notify tree of observers, etc.) */
export const useObservers = <T>(): ObserversControl<T> => {
	const observersMap = useRef<PxthMap<ObserverArray<unknown>>>(new PxthMap());
	const batchUpdateObservers = useLazyRef<ObserverArray<BatchUpdate<T>>>(() => new ObserverArray());

	const batchUpdate = useCallback(
		(update: BatchUpdate<T>) => {
			batchUpdateObservers.current.call(update);
		},
		[batchUpdateObservers],
	);

	const observeBatchUpdates = useCallback(
		(observer: Observer<BatchUpdate<T>>) => batchUpdateObservers.current.add(observer),
		[batchUpdateObservers],
	);

	const stopObservingBatchUpdates = useCallback(
		(key: ObserverKey) => batchUpdateObservers.current.remove(key),
		[batchUpdateObservers],
	);

	const observe = useCallback(<V>(path: Pxth<V>, observer: Observer<V>) => {
		if (!observersMap.current.has(path)) {
			observersMap.current.set(path, new ObserverArray());
		}

		return observersMap.current.get(path).add(observer as Observer<unknown>);
	}, []);

	const stopObserving = useCallback(<V>(path: Pxth<V>, observerKey: ObserverKey) => {
		const currentObservers = observersMap.current.get(path);

		invariant(currentObservers, 'Cannot remove observer from value, which is not observing');

		currentObservers.remove(observerKey);

		if (currentObservers.isEmpty()) {
			observersMap.current.remove(path);
		}
	}, []);

	const watch = useCallback(
		<V>(path: Pxth<V>, observer: Observer<V>) => {
			const key = observe(path, observer);
			return () => stopObserving(path, key);
		},
		[observe, stopObserving],
	);

	const watchAll = useCallback((observer: Observer<T>) => watch(createPxth<T>([]), observer), [watch]);

	const watchBatchUpdates = useCallback(
		(observer: Observer<BatchUpdate<T>>) => {
			const key = observeBatchUpdates(observer);

			return () => stopObservingBatchUpdates(key);
		},
		[observeBatchUpdates, stopObservingBatchUpdates],
	);

	const isObserved = useCallback(<V>(path: Pxth<V>) => observersMap.current.has(path), []);

	const notifyPaths = useCallback(
		(origin: Pxth<unknown>, paths: Pxth<unknown>[], values: T) => {
			batchUpdate({ paths, origin, values });
			paths.forEach((path) => {
				const observer = observersMap.current.get(path);
				const subValue = deepGet(values, path);
				observer.call(subValue);
			});
		},
		[batchUpdate],
	);

	const notifySubTree = useCallback(
		<V>(path: Pxth<V>, values: T) => {
			const subPaths = observersMap.current
				.keys()
				.filter(
					(tempPath) =>
						isInnerPxth(path as Pxth<unknown>, tempPath) ||
						samePxth(path as Pxth<unknown>, tempPath) ||
						isInnerPxth(tempPath, path as Pxth<unknown>),
				);

			notifyPaths(path as Pxth<unknown>, subPaths, values);
		},
		[notifyPaths],
	);

	const notifyAll = useCallback(
		(values: T) => notifyPaths(createPxth([]), observersMap.current.keys(), values),
		[notifyPaths],
	);

	return {
		watch,
		watchAll,
		watchBatchUpdates,
		isObserved,
		notifySubTree,
		notifyAll,
	};
};
