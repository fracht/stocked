import toPath from 'lodash/toPath';
import get from 'lodash/get';
import set from 'lodash/set';
import invariant from 'tiny-invariant';

/**
 * Function, which normalizes path.
 *
 * Example:
 *
 * array[0].value.1.child -> array.0.value.1.child
 *
 * @param path - path to normalize
 */
export const normalizePath = (path: string) =>
    toPath(path)
        .join('.')
        .trim();

/**
 * Function, which indicates, if path is child of another or not.
 *
 * Example:
 *
 * isInnerPath('parent', 'parent.child') -> true
 * isInnerPath('notParent', 'parent.child') -> false
 *
 * @param _basePath - path, which is probably parent
 * @param _path - path, which is probably child of _basePath
 */
export const isInnerPath = (_basePath: string, _path: string) => {
    const path = normalizePath(_path);
    const basePath = normalizePath(_basePath);
    return path.indexOf(basePath + '.') === 0 && path.replace(basePath, '').trim().length > 0;
};

export const findDeepestParent = (_path: string, _possiblePaths: string[]) =>
    _possiblePaths.sort((a, b) => b.length - a.length).find(parentPath => isInnerPath(parentPath, _path));

export const getOrReturn = (object: unknown, path: string) => {
    if (path.trim().length === 0) {
        return object;
    } else {
        return get(object, path);
    }
};

export const longestCommonPath = (paths: string[]) => {
    if (paths.length === 0) return '';
    if (paths.length === 1) return normalizePath(paths[0]);
    const sortedPaths = paths.sort();
    const firstPath = toPath(sortedPaths[0]);
    const lastPath = toPath(sortedPaths[sortedPaths.length - 1]);
    for (let i = 0; i < firstPath.length; i++) {
        if (firstPath[i] !== lastPath[i]) {
            return firstPath.slice(0, i).join('.');
        }
    }
    return firstPath.join('.');
};

export const setOrReturn = (object: object, path: string, value: unknown) => {
    if (path.trim().length === 0) {
        return value;
    } else {
        return set(object, path, value);
    }
};

export const relativePath = (_basePath: string, _subPath: string) => {
    const basePath = normalizePath(_basePath);
    const subPath = normalizePath(_subPath);

    if (basePath.trim().length === 0) return _subPath;

    invariant(subPath.indexOf(basePath) === 0, `"${subPath}" is not sub path of "${basePath}"`);

    if (basePath === subPath) {
        return '';
    } else {
        return subPath.replace(basePath + '.', '');
    }
};
