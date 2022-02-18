import { shuffle } from 'lodash';
import { createPxth, getPxthSegments, pxthToString, RootPathToken } from 'pxth';

import {
    isInnerPath,
    joinPaths,
    longestCommonPath,
    normalizePath,
    relativePath,
    samePxth,
} from '../../src/utils/pathUtils';

describe('samePxth', () => {
    it('should compare 2 paths', () => {
        expect(samePxth(createPxth(['a', 'b']), createPxth(['a', 'b']))).toBeTruthy();
        expect(samePxth(createPxth(['a', 'b']), createPxth(['b', 'a']))).toBeFalsy();
    });
});

describe('joinPaths', () => {
    it('should join paths', () => {
        expect(pxthToString(joinPaths(createPxth(['hello']), createPxth(['world'])))).toBe('hello.world');
        expect(pxthToString(joinPaths(createPxth([]), createPxth(['hello'])))).toBe('hello');
        expect(pxthToString(joinPaths(createPxth([]), createPxth(['hello']), createPxth(['world'])))).toBe(
            'hello.world'
        );
        expect(getPxthSegments(joinPaths(createPxth(['hello.world', 'path']), createPxth(['another'])))).toStrictEqual([
            'hello.world',
            'path',
            'another',
        ]);
        expect(getPxthSegments(joinPaths(createPxth(['..a.b.c...']), createPxth(['...'])))).toStrictEqual([
            '..a.b.c...',
            '...',
        ]);
    });
});

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

describe('longestCommonPath', () => {
    it('hit cases', () => {
        expect(longestCommonPath([])).toBe(RootPathToken);
        expect(longestCommonPath([''])).toBe('');
        expect(longestCommonPath(['asdf'])).toBe('asdf');
    });
    it('should return longest common path', () => {
        expect(longestCommonPath(['asdf', 'asdf.hello', 'asdf.bye', 'asdf.hello.bye'])).toBe('asdf');
        expect(longestCommonPath(['hello.this.is.world', 'hello.this.is.bye', 'hello.this.is'])).toBe('hello.this.is');
    });
    it('no common paths', () => {
        expect(longestCommonPath(shuffle(['asdf', 'asdf.hello', 'asdf.bye', 'asdf.hello.bye', 'b']))).toBe(
            RootPathToken
        );
        expect(
            longestCommonPath(shuffle(['hello.this.is.world', 'hello.this.is.bye', 'hello.this.is', 'ahello']))
        ).toBe(RootPathToken);
    });
});

describe('relativePath', () => {
    it('hit cases', () => {
        expect(() => relativePath(createPxth(['      ']), createPxth(['hello', 'world', 'this']))).toThrow();
        expect(() =>
            relativePath(
                createPxth(['hello', 'world', 'this', 'is', 'not', 'parent', 'path']),
                createPxth(['hello', 'world', 'this', 'is', 'not', 'nested', 'path'])
            )
        ).toThrow();
        expect(
            pxthToString(
                relativePath(createPxth(['hello', 'world', '0', 'same']), createPxth(['hello', 'world', '0', 'same']))
            )
        ).toBe(pxthToString(createPxth([])));
        expect(pxthToString(relativePath(createPxth([]), createPxth([])))).toBe(pxthToString(createPxth([])));
        expect(pxthToString(relativePath(createPxth([]), createPxth(['nested', 'path'])))).toBe(
            pxthToString(createPxth(['nested', 'path']))
        );
        expect(() => relativePath(createPxth(['helo']), createPxth([]))).toThrow();
        expect(pxthToString(relativePath(createPxth(['', '', 'asdf']), createPxth(['', '', 'asdf', 'lol'])))).toBe(
            pxthToString(createPxth(['lol']))
        );
    });
    it('simple cases', () => {
        expect(
            pxthToString(relativePath(createPxth(['hello', 'world']), createPxth(['hello', 'world', 'nested', 'path'])))
        ).toBe(pxthToString(createPxth(['nested', 'path'])));
        expect(
            pxthToString(
                relativePath(
                    createPxth(['yes', 'this', 'is', '0', 'some', 'path']),
                    createPxth(['yes', 'this', 'is', '0', 'some', 'path', 'asdf', 'lol'])
                )
            )
        ).toBe(pxthToString(createPxth(['asdf', 'lol'])));
    });
});
