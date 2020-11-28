import { getProxiedValue, isMappingProxy } from '../../src/utils/proxyUtils';

describe('isMappingProxy', () => {
    it('should detect mapping proxy', () => {
        expect(
            isMappingProxy({
                input: '',
                output: '',
                map: {},
            })
        ).toBeTruthy();

        expect(
            isMappingProxy({
                input: '',
                output: '',
                get: () => {},
                set: () => {},
            })
        ).toBeFalsy();
    });
});

describe('getProxiedValue', () => {
    it('should execute MappingProxy', () => {
        expect(
            getProxiedValue(
                {
                    customer_firstname: 'Hello',
                    customer_lastname: 'Bye',
                    customer_status: 'Hello world!',
                },
                {
                    input: '',
                    output: '',
                    map: {
                        'user.name.first': 'customer_firstname',
                        'user.name.last': 'customer_lastname',
                        'user.status': 'customer_status',
                    },
                }
            )
        ).toStrictEqual({
            user: {
                name: {
                    first: 'Hello',
                    last: 'Bye',
                },
                status: 'Hello world!',
            },
        });
    });
    it('should execute functional proxy', () => {
        expect(
            getProxiedValue(
                {
                    customer_name: 'Hello World',
                    customer_status: 'Status',
                },
                {
                    input: '',
                    output: '',
                    get: (input: { customer_name: string; customer_status: string }) => {
                        return {
                            user: {
                                name: {
                                    first: input.customer_name.split(' ')[0],
                                    last: input.customer_name.split(' ')[1],
                                },
                                status: input.customer_status,
                            },
                        };
                    },
                    set: () => {},
                }
            )
        ).toStrictEqual({
            user: {
                name: {
                    first: 'Hello',
                    last: 'World',
                },
                status: 'Status',
            },
        });
    });
});
