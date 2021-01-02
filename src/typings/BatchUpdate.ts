/** Object, in which "stocked" calls observers */
export type BatchUpdate<T> = {
    /** which paths should be updated */
    paths: Array<string | symbol>;
    /** all values, which should be sent to observers */
    values: T;
};
