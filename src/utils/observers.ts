import invariant from 'tiny-invariant';
import { Observer } from '../typings/Observer';

/**
 * Removes observer from array
 * @param observers - array, from wich observer should be removed.
 * @param toRemove - observer which will be removed.
 */
export const removeObserver = <V>(observers: Array<Observer<V>>, toRemove: Observer<V>) => {
    const indexOf = observers.indexOf(toRemove);

    invariant(indexOf !== -1, 'Could not remove observer from array, because observer do not exists in that array');

    observers.splice(indexOf, 1);
};

/**
 * Function, which sends message to all observers of the array.
 * @param observers - observer array, which should be called.
 * @param message - message to send for all observers.
 */
export const callObservers = <V>(observers: Array<Observer<V>>, message: V) =>
    observers.forEach(observer => observer(message));
