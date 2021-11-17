import { Pxth, pxthToString } from 'pxth';

export const areProxyMapsEqual = (a: Record<string, Pxth<unknown>>, b: Record<string, Pxth<unknown>>) => {
    const aEntries = Object.entries(a);

    if (aEntries.length !== Object.entries(b).length) {
        return false;
    }

    for (const [key, value] of aEntries) {
        if (typeof b[key] !== 'object' || b[key] === null || pxthToString(b[key]) !== pxthToString(value)) {
            return false;
        }
    }

    return true;
};
