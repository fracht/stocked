import invariant from 'tiny-invariant';
import { Observer } from '../typings/Observer';

export const removeObserver = <V>(observers: Array<Observer<V>>, toRemove: Observer<V>) => {
    const indexOf = observers.indexOf(toRemove);

    invariant(indexOf !== -1, 'Could not remove observer from array, because observer do not exists in that array');

    observers.splice(indexOf, 1);
};

export const callObservers = <V>(observers: Array<Observer<V>>, message: V) =>
    observers.forEach(observer => observer(message));
