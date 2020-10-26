import toPath from 'lodash/toPath';

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
