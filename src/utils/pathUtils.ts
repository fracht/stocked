import toPath from 'lodash/toPath';
import {
    createPxth,
    getPxthSegments,
    parseSegmentsFromString,
    Pxth,
    pxthToString,
    RootPath,
    RootPathToken,
} from 'pxth';
import invariant from 'tiny-invariant';

export const joinPaths = <V>(...segments: Pxth<unknown>[]): Pxth<V> => {
    if (segments.length === 0) {
        return createPxth([]);
    }

    return createPxth<V>([
        ...segments.map(getPxthSegments).reduce((acc, array) => {
            return acc.concat(array);
        }, []),
    ]);
};

/**
 * Function, which normalizes path.
 *
 * @example
 *
 * array[0].value.1.child -> array.0.value.1.child
 * path["to"][0].variable["yes"] -> path.to.0.variable.yes
 *
 * @param path - path to normalize
 */
export function normalizePath(path: string): string;
export function normalizePath(path: RootPath): RootPath;

export function normalizePath(path: string | RootPath) {
    return path === RootPathToken
        ? path
        : toPath(path)
              .join('.')
              .trim();
}

/**
 * Function, which indicates, if path is child of another or not.
 *
 * @example
 *
 * isInnerPath('parent', 'parent.child') -> true
 * isInnerPath('notParent', 'parent.child') -> false
 *
 * @param _basePath - path, which is probably parent
 * @param _path - path, which is probably child of _basePath
 */
export const isInnerPath = (_basePath: string | RootPath, _path: string | RootPath) => {
    if (_basePath === RootPathToken) return true;
    if (_path === RootPathToken) return false;
    const path = normalizePath(_path);
    const basePath = normalizePath(_basePath);
    return path.indexOf(basePath + '.') === 0 && path.replace(basePath, '').trim().length > 0;
};

/**
 * Finds longest common path.
 * @example
 * ['hello.world', 'hello.world.yes', 'hello.world.bye.asdf'] -> 'hello.world'
 * ['a', 'b', 'c'] -> ROOT_PATH
 */
export const longestCommonPath = (paths: string[]): string | RootPath => {
    if (paths.length === 0) return RootPathToken;
    if (paths.length === 1) return normalizePath(paths[0]);
    const sortedPaths = paths.sort();
    const firstPath = toPath(sortedPaths[0]);
    const lastPath = toPath(sortedPaths[sortedPaths.length - 1]);
    for (let i = 0; i < firstPath.length; i++) {
        if (firstPath[i] !== lastPath[i]) {
            return firstPath.slice(0, i).join('.') || RootPathToken;
        }
    }
    return firstPath.join('.');
};

/**
 * Returns relative path. If subPath is not child of basePath, it will throw an error.
 * @example
 * relativePath('hello.world', 'hello.world.asdf') -> 'asdf',
 * relativePath('a.b.c', 'a.b.c.d.e') -> 'd.e',
 * relativePath('a', 'b') -> Error
 */
export const relativePath = <A, B>(_basePath: Pxth<A>, _subPath: Pxth<B>): Pxth<B> => {
    const basePath = pxthToString(_basePath);
    const subPath = pxthToString(_subPath);

    if (basePath === RootPathToken && subPath === RootPathToken) {
        return createPxth([]);
    }

    if (basePath === RootPathToken) {
        return _subPath;
    }

    invariant(subPath !== RootPathToken, `ROOT_PATH symbol cannot be sub path of any path ("${basePath}")`);

    invariant(basePath.length > 0 && subPath.indexOf(basePath) === 0, `"${subPath}" is not sub path of "${basePath}"`);

    if (basePath === subPath) {
        return createPxth([]);
    } else {
        return createPxth(parseSegmentsFromString(subPath.replace(basePath + '.', '')));
    }
};
