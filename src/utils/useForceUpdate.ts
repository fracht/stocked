import { useReducer } from 'react';

export const useForceUpdate = () => {
    const [, forceUpdate] = useReducer((value: number) => value++, 0);

    return forceUpdate;
};
