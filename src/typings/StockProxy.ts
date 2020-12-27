import { ObserverKey } from '../utils/ObserverArray';
import { Observer } from './Observer';

export abstract class StockProxy {
    public readonly path: string;

    public constructor(path: string) {
        this.path = path;
    }

    public abstract setValue: (
        path: string,
        value: unknown,
        defaultSetValue: (path: string, value: unknown) => void
    ) => void;

    public abstract observe: <V>(
        path: string,
        observer: Observer<V>,
        defaultObserve: (path: string, observer: Observer<V>) => ObserverKey
    ) => ObserverKey;

    public abstract stopObserving: (
        path: string,
        key: ObserverKey,
        defaultStopObserving: (path: string, key: ObserverKey) => void
    ) => void;

    public activate = () => Object.freeze(this);

    public isActive = () => Object.isFrozen(this);
}
