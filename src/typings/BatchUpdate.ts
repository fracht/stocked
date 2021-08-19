import { ROOT_PATH } from '..';

/** Object, in which "stocked" calls observers */
export type BatchUpdate<T> = {
    /** which paths should be updated */
    paths: string[];
    /** path, which triggered subtree update */
    origin: string | typeof ROOT_PATH;
    /** all values, which should be sent to observers */
    values: T;
};
