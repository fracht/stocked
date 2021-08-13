import get from 'lodash/get';
import set from 'lodash/set';
import toPath from 'lodash/toPath';
import invariant from 'tiny-invariant';

import { ROOT_PATH } from '../hooks/useObservers';

export const joinPaths = (...segments: (string | typeof ROOT_PATH)[]) => {
    const filteredSegments = segments.filter(segment => segment !== ROOT_PATH);

    if (filteredSegments.length === 0) {
        return ROOT_PATH;
    }

    return filteredSegments.join('.');
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
export function normalizePath(path: typeof ROOT_PATH): typeof ROOT_PATH;

export function normalizePath(path: string | typeof ROOT_PATH) {
    return path === ROOT_PATH
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
export const isInnerPath = (_basePath: string | typeof ROOT_PATH, _path: string | typeof ROOT_PATH) => {
    if (_basePath === ROOT_PATH) return true;
    if (_path === ROOT_PATH) return false;
    const path = normalizePath(_path);
    const basePath = normalizePath(_basePath);
    return path.indexOf(basePath + '.') === 0 && path.replace(basePath, '').trim().length > 0;
};

/**
 * Provides same functionality, as @see https://lodash.com/docs/4.17.15#get
 * @param object - object, where should be value taken
 * @param path - path to deep variable
 */
export const getOrReturn = (object: unknown, path: string | typeof ROOT_PATH) => {
    if (path === ROOT_PATH) {
        return object;
    } else {
        return get(object, path);
    }
};

/**
 * Provides same functionality, as @see https://lodash.com/docs/4.17.15#set
 * @param object - object, where should be set
 * @param path - path to set deep variable
 * @param value - value to set
 */
export const setOrReturn = (object: object, path: string | typeof ROOT_PATH, value: unknown) => {
    if (path === ROOT_PATH) {
        return value;
    } else {
        return set(object, path, value);
    }
};

/**
 * Finds longest common path.
 * @example
 * ['hello.world', 'hello.world.yes', 'hello.world.bye.asdf'] -> 'hello.world'
 * ['a', 'b', 'c'] -> ROOT_PATH
 */
export const longestCommonPath = (paths: string[]): string | typeof ROOT_PATH => {
    if (paths.length === 0) return ROOT_PATH;
    if (paths.length === 1) return normalizePath(paths[0]);
    const sortedPaths = paths.sort();
    const firstPath = toPath(sortedPaths[0]);
    const lastPath = toPath(sortedPaths[sortedPaths.length - 1]);
    for (let i = 0; i < firstPath.length; i++) {
        if (firstPath[i] !== lastPath[i]) {
            return firstPath.slice(0, i).join('.') || ROOT_PATH;
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
export const relativePath = (_basePath: string | typeof ROOT_PATH, _subPath: string | typeof ROOT_PATH) => {
    if (_basePath === ROOT_PATH && _subPath === ROOT_PATH) {
        return ROOT_PATH;
    }

    if (_basePath === ROOT_PATH) {
        return _subPath;
    }

    const basePath = normalizePath(_basePath);

    invariant(_subPath !== ROOT_PATH, `ROOT_PATH symbol cannot be sub path of any path ("${basePath}")`);

    const subPath = normalizePath(_subPath as string);

    invariant(basePath.length > 0 && subPath.indexOf(basePath) === 0, `"${subPath}" is not sub path of "${basePath}"`);

    if (basePath === subPath) {
        return (ROOT_PATH as unknown) as string;
    } else {
        return subPath.replace(basePath + '.', '');
    }
};
