import { createPxth, RootPathToken } from 'pxth';

import { flattenProxyMap } from '../../src/utils/flattenProxyMap';

describe('flatten proxy map', () => {
    it('should flatten empty', () => {
        expect(flattenProxyMap({})).toStrictEqual({});
    });

    it('should flatten nested object', () => {
        const somePath = createPxth(['some', 'path']);
        const pathToName = createPxth(['path', 'to', 'name']);
        const pathToSurname = createPxth(['path', 'to', 'surname']);

        const flattenMap = flattenProxyMap({
            path: {
                hello: somePath,
                field: {
                    name: pathToName,
                    surname: pathToSurname,
                },
            },
        });

        // https://github.com/facebook/jest/issues/10788 jest throws error when function returns proxied objects
        // ERROR: TypeError: b[IteratorSymbol] is not a function
        // expect(flattenMap).toStrictEqual({
        //     'path.hello': somePath,
        //     'path.field.name': pathToName,
        //     'path.field.surname': pathToSurname,
        // });

        expect(flattenMap['path.hello']).toBe(somePath);
        expect(flattenMap['path.field.name']).toBe(pathToName);
        expect(flattenMap['path.field.surname']).toBe(pathToSurname);
    });

    it('should flatten RootPath symbol', () => {
        const path = createPxth(['path']);

        const flattenMap = flattenProxyMap({
            [RootPathToken]: path,
        });

        expect(flattenMap[RootPathToken]).toBe(path);
    });

    it('should flatten maps with arrays', () => {
        const flattenMap = flattenProxyMap<{ people: Array<{ phone: number; name: string }> }>({
            people: index => ({
                name: createPxth(['names', index.toString()]),
                phone: createPxth(['phones', index.toString()]),
            }),
        });

        console.log(flattenMap);
    });
});
