import { shuffle } from 'lodash';
import { findDeepestParent, isInnerPath, normalizePath } from '../../src/utils/pathUtils';

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

describe('findDeepestParent', () => {
    it('findDeepestParent only one parent', () => {
        expect(findDeepestParent('hello.world', ['a', 'absc', 'qqq', 'hello', 'bye'])).toBe('hello');
        expect(
            findDeepestParent('hello.world[0].lol', ['ello.worldd', 'hello.worldd', 'hello[0]', 'hello.world.0', 'bye'])
        ).toBe('hello.world.0');
    });
    it('findDeepestParent few possible parents: should peek deepest', () => {
        expect(
            findDeepestParent(
                'hello.world.this.is.path',
                shuffle(['hello', 'hello.world', 'hello.world.this', 'hello.world.this.a', 'hello.worldd'])
            )
        ).toBe('hello.world.this');
    });
    it('findDeepestParent with no possible parents', () => {
        expect(findDeepestParent('hello.this.is.no.path', ['a', 'asdf.hello.this', 'hello.this.not', 'basdf'])).toBe(
            undefined
        );
    });
});
