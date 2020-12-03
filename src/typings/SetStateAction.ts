export type SetStateAction<S> = S | ((value: S) => S);
export type Dispatch<A> = (value: A) => void;
