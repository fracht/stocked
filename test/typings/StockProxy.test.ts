import { MappingProxy } from '../../src/typings';

describe('proxy instantiation', () => {
    it('MappingProxy', () => {
        expect(() => new MappingProxy({ a: 'a' }, '')).not.toThrow();
    });
});
