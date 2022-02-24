import { getPxthSegments, Pxth } from 'pxth';

export const hashPxth = <V>(pxth: Pxth<V>) => JSON.stringify(getPxthSegments(pxth));
