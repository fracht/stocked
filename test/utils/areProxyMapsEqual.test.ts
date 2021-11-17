import { createPxth } from 'pxth';

import { areProxyMapsEqual } from '../../src/utils/areProxyMapsEqual';

describe('areProxyMapsEqual', () => {
    it('should return false if objects have different amount of entries', () => {
        expect(areProxyMapsEqual({}, { a: createPxth([]) })).toBeFalsy();
        expect(areProxyMapsEqual({ a: createPxth([]) }, {})).toBeFalsy();
        expect(areProxyMapsEqual({ a: createPxth([]) }, { a: createPxth([]), b: createPxth([]) })).toBeFalsy();
    });

    it('should return false when objects differ', () => {
        expect(areProxyMapsEqual({ a: createPxth(['hello1']) }, { a: createPxth(['hello']) })).toBeFalsy();
        expect(areProxyMapsEqual({ a: createPxth(['bye']) }, { b: createPxth(['bye']) })).toBeFalsy();
    });

    it('should return true if objects are same', () => {
        expect(areProxyMapsEqual({ a: createPxth([]) }, { a: createPxth([]) })).toBeTruthy();
        expect(areProxyMapsEqual({ a: createPxth(['bye']) }, { a: createPxth(['bye']) })).toBeTruthy();
    });
});
