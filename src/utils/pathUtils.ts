import toPath from 'lodash/toPath';

export const normalizePath = (path: string) =>
    toPath(path)
        .join('.')
        .trim();

export const isInnerPath = (_basePath: string, _path: string) => {
    const path = normalizePath(_path);
    const basePath = normalizePath(_basePath);
    return path.indexOf(basePath + '.') === 0 && path.replace(basePath, '').trim().length > 0;
};

export const joinPaths = (..._paths: (string | undefined)[]): string => _paths.filter(Boolean).join('.');

export const pickInnerPaths = (path: string, availablePaths: string[]) => {
    const allInnerPaths = availablePaths
        .filter((avPath) => isInnerPath(path, avPath))
        .sort((a, b) => a.length - b.length);

    const filteredPaths: string[] = [];

    allInnerPaths.forEach((innerPath) => {
        if (filteredPaths.every((curPath) => innerPath.indexOf(curPath) === -1)) {
            filteredPaths.push(innerPath);
        }
    });

    return filteredPaths;
};

export const relativePath = (_basePath: string, _path: string) => {
    const path = normalizePath(_path);
    const basePath = normalizePath(_basePath);
    if (path === basePath) {
        return '';
    }
    if (path.indexOf(basePath + '.') === -1) {
        throw new Error(`Could not convert path to relative path. "${_path}" is not child of "${_basePath}".`);
    }

    return path
        .replace(basePath + '.', '')
        .trim()
        .replace(/(^\.+)|(\.+$)/g, '')
        .trim();
};

export const parentPath = (path: string, avaialblePaths: string[]): string | undefined =>
    avaialblePaths.filter((avaialblePath) => isInnerPath(avaialblePath, path)).sort((a, b) => b.length - a.length)[0];
