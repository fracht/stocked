import { cloneDeep, shuffle } from 'lodash';
import { ROOT_PATH } from '../../src/hooks';
import {
    getOrReturn,
    isInnerPath,
    longestCommonPath,
    normalizePath,
    relativePath,
    setOrReturn,
} from '../../src/utils/pathUtils';

describe('normalizePath', () => {
    it('"   hello.tst[0].b   " = "hello.tst.0.b"', () => {
        expect(normalizePath('   hello.tst[0].b   ')).toBe('hello.tst.0.b');
    });
});

describe('isInnerPath', () => {
    it('isInnerPath false', () => {
        expect(isInnerPath('hello', 'b')).toBe(false);
        expect(isInnerPath('hello', 'helloa')).toBe(false);
        expect(isInnerPath('hello', 'chello')).toBe(false);
        expect(isInnerPath('hello.asdf', 'hello.a')).toBe(false);
        expect(isInnerPath('hello.asdf', 'helloa')).toBe(false);
    });
    it('isInnerPath simple cases', () => {
        expect(isInnerPath('hello', 'hello.asdf')).toBe(true);
        expect(isInnerPath('hello', 'hello.asdf.asdf')).toBe(true);
        expect(isInnerPath('hello', 'hello.hello.hello')).toBe(true);
    });
    it('isInnerPath complex cases', () => {
        expect(isInnerPath('hello.asdf.bsdf', 'hello.asdf.bsdf.lol.k.w')).toBe(true);
        expect(isInnerPath('hello[0].bsdf', 'hello.0.bsdf.lol.k.w')).toBe(true);
    });
});

describe('getOrReturn', () => {
    it('should get value on empty path', () => {
        const value = { hello: 'asdf', '': 42 };
        expect(getOrReturn(cloneDeep(value), '')).toStrictEqual(42);
    });
    it('should get deep value', () => {
        const value = { asdf: 'basd' };
        expect(getOrReturn(cloneDeep(value), 'asdf')).toBe('basd');
    });
    it('should return all values on ROOT_PATH', () => {
        const value = { asdf: 42, array: [1, 2] };
        expect(getOrReturn(value, ROOT_PATH)).toStrictEqual(value);
    });
});

describe('setOrReturn', () => {
    it('should set value on empty path', () => {
        const value = { hello: 'asdf' };
        expect(setOrReturn(cloneDeep(value), '', { a: 'asdf' })).toStrictEqual({ '': { a: 'asdf' }, hello: 'asdf' });
    });
    it('should set value', () => {
        const value = { asdf: 'basd' };
        expect(setOrReturn(cloneDeep(value), 'asdf', 'HELLO')).toStrictEqual({ asdf: 'HELLO' });
    });
    it('should return all values on ROOT_PATH', () => {
        const value = { asdf: 42, array: [1, 2] };
        const newValue = { hello: 'world' };
        expect(setOrReturn(cloneDeep(value), ROOT_PATH, newValue)).toStrictEqual(newValue);
    });
});

describe('longestCommonPath', () => {
    it('hit cases', () => {
        expect(longestCommonPath([])).toBe('');
        expect(longestCommonPath([''])).toBe('');
        expect(longestCommonPath(['asdf'])).toBe('asdf');
    });
    it('should return longest common path', () => {
        expect(longestCommonPath(['asdf', 'asdf.hello', 'asdf.bye', 'asdf.hello.bye'])).toBe('asdf');
        expect(longestCommonPath(['hello.this.is.world', 'hello.this.is.bye', 'hello.this.is'])).toBe('hello.this.is');
    });
    it('no common paths', () => {
        expect(longestCommonPath(shuffle(['asdf', 'asdf.hello', 'asdf.bye', 'asdf.hello.bye', 'b']))).toBe('');
        expect(
            longestCommonPath(shuffle(['hello.this.is.world', 'hello.this.is.bye', 'hello.this.is', 'ahello']))
        ).toBe('');
    });
});

describe('relativePath', () => {
    it('hit cases', () => {
        expect(relativePath('      ', 'hello.world.this')).toBe('hello.world.this');
        expect(() =>
            relativePath('hello.world.this.is.not.parent.path', 'hello.world.this.is.not.nested.path')
        ).toThrow();
        expect(relativePath('hello.world[0].same', 'hello["world"].0.same')).toBe(ROOT_PATH);
    });
    it('simple cases', () => {
        expect(relativePath('hello.world', 'hello.world.nested.path')).toBe('nested.path');
        expect(relativePath('yes.this["is"][0]["some"].path', 'yes.this.is.0.some.path["asdf"].lol')).toBe('asdf.lol');
    });
});
