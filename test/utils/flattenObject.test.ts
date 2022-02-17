import { flattenObject } from '../../src/utils/flattenObject';

describe('flatten object', () => {
    it('should handle unusual cases', () => {
        expect(flattenObject({})).toStrictEqual({});
    });

    it('should handle usual cases', () => {
        expect(
            flattenObject({
                path: {
                    hello: 42,
                    field: {
                        name: 'asdf',
                        surname: 'asdf',
                    },
                },
            })
        ).toStrictEqual({
            'path.hello': 42,
            'path.field.name': 'asdf',
            'path.field.surname': 'asdf',
        });
    });
});
