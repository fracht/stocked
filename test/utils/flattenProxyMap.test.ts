import { createPxth } from 'pxth';

import { flattenProxyMap } from '../../src/utils/flattenProxyMap';

describe('flatten proxy map', () => {
    it('should handle unusual cases', () => {
        expect(flattenProxyMap({})).toStrictEqual({});
    });

    it('should handle usual cases', () => {
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
});
