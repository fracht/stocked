import { ROOT_PATH } from '../hooks';
import { Observer } from './Observer';

/**
 * Abstract class of "stocked" proxy
 * By inheriting this class, you can provide custom logic for proxing (casting) values.
 */
export abstract class StockProxy {
    /** Path to variable, where proxy is attached. */
    public readonly path: string | typeof ROOT_PATH;

    public constructor(path: string | typeof ROOT_PATH) {
        this.path = path;
    }

    /** Function, which sets proxied value. It will be callen only if proxied value is changing. */
    public abstract setValue: (
        path: string | typeof ROOT_PATH,
        value: unknown,
        defaultSetValue: (path: string | typeof ROOT_PATH, value: unknown) => void
    ) => void;

    /** Function for watching proxied value. Should return cleanup. */
    public abstract watch: <V>(
        path: string | typeof ROOT_PATH,
        observer: Observer<V>,
        defaultWatch: (path: string | typeof ROOT_PATH, observer: Observer<V>) => () => void
    ) => () => void;

    /** Function to access proxied value. */
    public abstract getValue: <V>(
        path: string | typeof ROOT_PATH,
        defaultGetValue: <U>(path: string | typeof ROOT_PATH) => U
    ) => V;

    /** Function for getting proxied path from normal path. */
    public abstract getProxiedPath: (path: string | typeof ROOT_PATH) => string | typeof ROOT_PATH;

    /** Function for getting normal path from proxied path */
    public abstract getNormalPath: (path: string | typeof ROOT_PATH) => string | typeof ROOT_PATH;

    /** Activate proxy. After activation, you cannot modify proxy. */
    public activate = () => Object.freeze(this);

    /** Returns boolean, is proxy active and ready for use or not. */
    public isActive = () => Object.isFrozen(this);
}
