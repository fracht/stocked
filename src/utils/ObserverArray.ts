import invariant from 'tiny-invariant';

import { Observer } from '../typings/Observer';

export type ObserverKey = number;

export class ObserverArray<V> {
    private readonly observers: Record<ObserverKey, Observer<V>> = {};
    private counter = 0;

    /**
     * Calls all observers in the array.
     * @param message - message, which would be sent to all observers
     */
    public call(message: V) {
        Object.values(this.observers).forEach(observer => observer(message));
    }

    /**
     * Registers new observer and returns key, which will be used for removing observer.
     * @param observer - registers new observer
     */
    public add(observer: Observer<V>): ObserverKey {
        const key = this.counter++;
        this.observers[key] = observer;
        return key;
    }

    /**
     * Removes observer from array. Throws an error, if observer with that key not exists.
     * @param key - key to observer
     */
    public remove(key: ObserverKey) {
        invariant(
            Object.prototype.hasOwnProperty.call(this.observers, key),
            `Could not remove observer: observer with key ${key} not exists`
        );
        delete this.observers[key];
    }

    /**
     * Does array include at least one observer or not.
     */
    public isEmpty = () => Object.values(this.observers).length === 0;
}
