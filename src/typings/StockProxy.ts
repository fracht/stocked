import { Observer } from './Observer';

/**
 * Abstract class of "stocked" proxy
 * By inheriting this class, you can provide custom logic for proxing (casting) values.
 */
export abstract class StockProxy {
    /** Path to variable, where proxy is attached. */
    public readonly path: string;

    public constructor(path: string) {
        this.path = path;
    }

    /** Function, which sets proxied value. It will be callen only if proxied value is changing. */
    public abstract setValue: (
        path: string,
        value: unknown,
        defaultSetValue: (path: string, value: unknown) => void
    ) => void;

    /** Function for watching proxied value. Should return cleanup. */
    public abstract watch: <V>(
        path: string,
        observer: Observer<V>,
        defaultWatch: (path: string, observer: Observer<V>) => () => void
    ) => () => void;

    /** Function to access proxied value. */
    public abstract getValue: <V>(path: string, defaultGetValue: <U>(path: string) => U) => V;

    /** Activate proxy. After activation, you cannot modify proxy. */
    public activate = () => Object.freeze(this);

    /** Returns boolean, is proxy active and ready for use or not. */
    public isActive = () => Object.isFrozen(this);
}
