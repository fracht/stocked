import { createPxth, deepGet, Pxth, pxthToString, RootPathToken } from 'pxth';

import { MappingProxy, Observer } from '../../src/typings';

describe('Mapping proxy', () => {
    it('should instantiate', () => {
        expect(() => new MappingProxy({}, createPxth(['']))).not.toThrowError();
    });

    it('observe/stopObserving value', () => {
        const proxy = new MappingProxy(
            { hello: createPxth(['a', 'b', 'c']), bye: createPxth(['a', 'b', 'd']) },
            createPxth(['asdf'])
        );

        const defaultObserve = jest.fn();
        const observer = jest.fn();

        defaultObserve.mockReturnValue(0);

        proxy.watch(createPxth(['asdf', 'hello']), observer, defaultObserve);

        expect(pxthToString(defaultObserve.mock.calls[0][0])).toBe(pxthToString(createPxth(['a', 'b', 'c'])));

        defaultObserve.mockClear();

        proxy.watch(createPxth(['asdf', 'bye']), observer, defaultObserve);
        expect(pxthToString(defaultObserve.mock.calls[0][0])).toBe(pxthToString(createPxth(['a', 'b', 'd'])));
    });

    it('observe/stopObserving value (empty parent path)', () => {
        const proxy = new MappingProxy(
            { hello: createPxth(['a', 'd', 'c']), bye: createPxth(['b', 'b', 'd']) },
            createPxth([])
        );

        const defaultObserve = jest.fn();
        const observer = jest.fn();

        defaultObserve.mockReturnValue(0);

        proxy.watch(createPxth(['hello']), observer, defaultObserve);
        expect(pxthToString(defaultObserve.mock.calls[0][0])).toBe(pxthToString(createPxth(['a', 'd', 'c'])));

        defaultObserve.mockClear();

        proxy.watch(createPxth(['bye']), observer, defaultObserve);
        expect(pxthToString(defaultObserve.mock.calls[0][0])).toBe(pxthToString(createPxth(['b', 'b', 'd'])));
    });

    it('observe/stopObserving (empty mapping path)', () => {
        const proxy = new MappingProxy({ [RootPathToken]: createPxth(['a', 'd', 'c']) }, createPxth(['asdf']));

        const defaultObserve = jest.fn();
        const observer = jest.fn();

        defaultObserve.mockReturnValue(0);

        proxy.watch(createPxth(['asdf']), observer, defaultObserve);
        expect(pxthToString(defaultObserve.mock.calls[0][0])).toBe(pxthToString(createPxth(['a', 'd', 'c'])));

        defaultObserve.mockClear();
    });

    it('calling observer fns', () => {
        const fullUser = {
            personalData: {
                name: {
                    firstName: 'Hello',
                    lastName: 'World',
                },
                birthday: new Date('2020.12.26'),
            },
            registrationDate: new Date('2020.12.31'),
            notify: true,
        };
        const rawData = {
            registeredUser: {
                name: fullUser.personalData.name.firstName,
                surname: fullUser.personalData.name.lastName,
                dates: {
                    registration: fullUser.registrationDate,
                },
            },
            dateOfBirth: fullUser.personalData.birthday,
        };

        const proxy = new MappingProxy(
            {
                'personalData.name.firstName': createPxth(['registeredUser', 'name']),
                'personalData.name.lastName': createPxth(['registeredUser', 'surname']),
                'personalData.birthday': createPxth(['dateOfBirth']),
                registrationDate: createPxth(['registeredUser', 'dates', 'registration']),
            },
            createPxth(['registeredUser'])
        );

        const observers: Observer<unknown>[] = [];

        const defaultObserve = jest.fn((_, observer) => {
            observers.push(observer);
            return () => observers.splice(observers.indexOf(observer), 1);
        });
        const observer = jest.fn();

        proxy.watch(createPxth(['registeredUser', 'personalData', 'name', 'firstName']), observer, defaultObserve);

        expect(pxthToString(defaultObserve.mock.calls[0][0])).toBe(
            pxthToString(createPxth(['registeredUser', 'name']))
        );

        defaultObserve.mockClear();

        proxy.watch(createPxth(['registeredUser', 'personalData', 'name']), observer, defaultObserve);
        expect(pxthToString(defaultObserve.mock.calls[0][0])).toBe(pxthToString(createPxth(['registeredUser'])));

        defaultObserve.mockClear();

        proxy.watch(createPxth(['registeredUser', 'personalData']), observer, defaultObserve);
        expect(pxthToString(defaultObserve.mock.calls[0][0])).toBe(pxthToString(createPxth([])));

        observers[0](rawData.registeredUser.name);

        expect(observer).toBeCalledWith(fullUser.personalData.name.firstName);

        observer.mockClear();

        observers[1](rawData.registeredUser);
        expect(observer).toBeCalledWith(fullUser.personalData.name);

        observer.mockClear();

        observers[2](rawData);
        expect(observer).toBeCalledWith(fullUser.personalData);
    });

    it('calling observer fns (complex cases)', () => {
        const fullData = {
            truck: {
                driver: {
                    name: 'Hello',
                    surname: 'Bye',
                    phone: '+333533333',
                },
                info: {
                    trailerNo: 'AAA111',
                    truckNo: 'AAA222',
                },
                owner: {
                    companyId: 0,
                    companyName: 'Hello World',
                    contacts: [
                        {
                            contactId: 0,
                            name: 'Bill Bill',
                            contactInfo: {
                                email: 'bill.bill@mail.loc',
                                phone: '+333 333 333',
                            },
                        },
                    ],
                },
            },
        };
        const rawData = {
            truck: {
                plate_no: fullData.truck.info.truckNo,
            },
            trailer: {
                plate_no: fullData.truck.info.trailerNo,
            },
            company: fullData.truck.owner.companyName,
            contact_name: fullData.truck.owner.contacts[0].name,
            contact_id: fullData.truck.owner.contacts[0].contactId,
            contact_email: fullData.truck.owner.contacts[0].contactInfo.email,
            contact_phone: fullData.truck.owner.contacts[0].contactInfo.phone,
        };

        const proxy = new MappingProxy(
            {
                'info.truckNo': createPxth(['truck', 'plate_no']),
                'info.trailerNo': createPxth(['trailer', 'plate_no']),
                'owner.contacts[0].name': createPxth(['contact_name']),
                'owner.contacts[0].contactId': createPxth(['contact_id']),
                'owner.contacts[0].contactInfo.email': createPxth(['contact_email']),
                'owner.contacts[0].contactInfo.phone': createPxth(['contact_phone']),
            },
            createPxth(['truck'])
        );

        const observers: Observer<unknown>[] = [];

        const defaultObserve = jest.fn((_, observer) => {
            observers.push(observer);
            return () => observers.splice(observers.indexOf(observer), 1);
        });
        const observer = jest.fn();

        proxy.watch(createPxth(['truck', 'owner', 'contacts', '0']), observer, defaultObserve);
        expect(pxthToString(defaultObserve.mock.calls[0][0])).toBe(pxthToString(createPxth([])));

        defaultObserve.mockClear();

        proxy.watch(createPxth(['truck', 'info']), observer, defaultObserve);
        expect(pxthToString(defaultObserve.mock.calls[0][0])).toBe(pxthToString(createPxth([])));

        observers[0](rawData);
        expect(observer).toBeCalledWith(fullData.truck.owner.contacts[0]);

        observer.mockClear();

        observers[1](rawData);
        expect(observer).toBeCalledWith(fullData.truck.info);
    });

    it('should set proxied value', () => {
        const proxy = new MappingProxy(
            {
                'personalData.name.firstName': createPxth(['registeredUser', 'name']),
                'personalData.name.lastName': createPxth(['registeredUser', 'surname']),
                'personalData.birthday': createPxth(['dateOfBirth']),
                registrationDate: createPxth(['registeredUser', 'dates', 'registration']),
            },
            createPxth(['registeredUser'])
        );

        const defaultSetValue = jest.fn();

        proxy.setValue(createPxth(['registeredUser', 'personalData', 'name', 'firstName']), 'Hello', defaultSetValue);

        expect(pxthToString(defaultSetValue.mock.calls[0][0])).toBe(
            pxthToString(createPxth(['registeredUser', 'name']))
        );
        expect(defaultSetValue).toBeCalledWith(expect.anything(), 'Hello');

        defaultSetValue.mockClear();

        proxy.setValue(
            createPxth(['registeredUser', 'personalData', 'name']),
            { firstName: 'As', lastName: 'Df' },
            defaultSetValue
        );

        expect(
            defaultSetValue.mock.calls.findIndex(
                ([path, value]) =>
                    pxthToString(path) === pxthToString(createPxth(['registeredUser', 'name'])) && value === 'As'
            ) !== -1
        ).toBeTruthy();

        expect(
            defaultSetValue.mock.calls.findIndex(
                ([path, value]) =>
                    pxthToString(path) === pxthToString(createPxth(['registeredUser', 'surname'])) && value === 'Df'
            ) !== -1
        ).toBeTruthy();
    });

    it('should get proxied value', () => {
        const fullUser = {
            personalData: {
                name: {
                    firstName: 'Hello',
                    lastName: 'World',
                },
                birthday: new Date('2020.12.26'),
            },
            registrationDate: new Date('2020.12.31'),
            notify: true,
        };
        const rawData = {
            registeredUser: {
                name: fullUser.personalData.name.firstName,
                surname: fullUser.personalData.name.lastName,
                dates: {
                    registration: fullUser.registrationDate,
                },
            },
            dateOfBirth: fullUser.personalData.birthday,
        };

        const proxy = new MappingProxy(
            {
                'personalData.name.firstName': createPxth(['registeredUser', 'name']),
                'personalData.name.lastName': createPxth(['registeredUser', 'surname']),
                'personalData.birthday': createPxth(['dateOfBirth']),
                registrationDate: createPxth(['registeredUser', 'dates', 'registration']),
            },
            createPxth(['registeredUser'])
        );

        const defaultGet = <V>(path: Pxth<V>) => deepGet(rawData, path);

        expect(proxy.getValue(createPxth(['registeredUser', 'personalData', 'name', 'firstName']), defaultGet)).toBe(
            fullUser.personalData.name.firstName
        );
        expect(proxy.getValue(createPxth(['registeredUser', 'personalData', 'name']), defaultGet)).toStrictEqual(
            fullUser.personalData.name
        );
        expect(proxy.getValue(createPxth(['registeredUser', 'personalData', 'birthday']), defaultGet)).toStrictEqual(
            fullUser.personalData.birthday
        );
    });

    it('should return normal path from proxied path', () => {
        const proxy = new MappingProxy(
            {
                'personalData.name.firstName': createPxth(['registeredUser', 'name']),
                'personalData.name.lastName': createPxth(['registeredUser', 'surname']),
                'personalData.birthday': createPxth(['dateOfBirth']),
                registrationDate: createPxth(['registeredUser', 'dates', 'registration']),
            },
            createPxth(['registeredUser'])
        );

        expect(pxthToString(proxy.getNormalPath(createPxth(['registeredUser', 'personalData'])))).toBe(
            pxthToString(createPxth([]))
        );
        expect(pxthToString(proxy.getNormalPath(createPxth(['registeredUser', 'registrationDate'])))).toBe(
            pxthToString(createPxth(['registeredUser', 'dates', 'registration']))
        );
        expect(pxthToString(proxy.getNormalPath(createPxth(['registeredUser', 'personalData', 'name'])))).toBe(
            pxthToString(createPxth(['registeredUser']))
        );
    });

    it('should return proxied path from normal path', () => {
        const proxy = new MappingProxy(
            {
                'personalData.name.firstName': createPxth(['registeredUser', 'name']),
                'personalData.name.lastName': createPxth(['registeredUser', 'surname']),
                'personalData.birthday': createPxth(['dateOfBirth']),
                registrationDate: createPxth(['registeredUser', 'dates', 'registration']),
            },
            createPxth(['registeredUser'])
        );

        expect(pxthToString(proxy.getProxiedPath(createPxth(['registeredUser', 'dates', 'registration'])))).toBe(
            pxthToString(createPxth(['registeredUser', 'registrationDate']))
        );
        expect(pxthToString(proxy.getProxiedPath(createPxth(['registeredUser', 'name'])))).toBe(
            pxthToString(createPxth(['registeredUser', 'personalData', 'name', 'firstName']))
        );
        expect(() => proxy.getProxiedPath(createPxth(['registeredUser', 'personalData']))).toThrow();
    });

    it('should proxy object values', () => {
        const proxy = new MappingProxy(
            {
                location: createPxth(['core', 'values', 'location_from']),
                cmpId: createPxth(['core', 'cmp_id_from']),
            },
            createPxth(['compound'])
        );

        expect(pxthToString(proxy.getNormalPath(createPxth(['compound', 'location', 'id'])))).toBe(
            pxthToString(createPxth(['core', 'values', 'location_from', 'id']))
        );
    });
});
