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
