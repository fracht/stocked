import { MappingProxy, Observer } from '../../src/typings';

describe('Mapping proxy', () => {
    it('should instantiate', () => {
        expect(() => new MappingProxy({}, '')).not.toThrowError();
    });

    it('observe/stopObserving value', () => {
        const proxy = new MappingProxy({ hello: 'a.b.c', bye: 'a.b.d' }, 'asdf');

        const defaultObserve = jest.fn();
        const observer = jest.fn();

        defaultObserve.mockReturnValue(0);

        proxy.observe('asdf.hello', observer, defaultObserve);
        expect(defaultObserve).toBeCalledWith('a.b.c', expect.any(Function));

        defaultObserve.mockClear();

        proxy.observe('asdf.bye', observer, defaultObserve);
        expect(defaultObserve).toBeCalledWith('a.b.d', expect.any(Function));

        defaultObserve.mockClear();

        proxy.stopObserving('asdf.hello', 0, defaultObserve);
        expect(defaultObserve).toBeCalledWith('a.b.c', 0);

        defaultObserve.mockClear();

        proxy.stopObserving('asdf.bye', 0, defaultObserve);
        expect(defaultObserve).toBeCalledWith('a.b.d', 0);
    });

    it('observe/stopObserving value (empty parent path)', () => {
        const proxy = new MappingProxy({ hello: 'a.d.c', bye: 'b.b.d' }, '');

        const defaultObserve = jest.fn();
        const observer = jest.fn();

        defaultObserve.mockReturnValue(0);

        proxy.observe('hello', observer, defaultObserve);
        expect(defaultObserve).toBeCalledWith('a.d.c', expect.any(Function));

        defaultObserve.mockClear();

        proxy.observe('bye', observer, defaultObserve);
        expect(defaultObserve).toBeCalledWith('b.b.d', expect.any(Function));

        defaultObserve.mockClear();

        proxy.stopObserving('hello', 0, defaultObserve);
        expect(defaultObserve).toBeCalledWith('a.d.c', 0);

        defaultObserve.mockClear();

        proxy.stopObserving('bye', 0, defaultObserve);
        expect(defaultObserve).toBeCalledWith('b.b.d', 0);
    });

    it('observe/stopObserving (empty mapping path)', () => {
        const proxy = new MappingProxy({ '': 'a.d.c' }, 'asdf');

        const defaultObserve = jest.fn();
        const observer = jest.fn();

        defaultObserve.mockReturnValue(0);

        proxy.observe('asdf', observer, defaultObserve);
        expect(defaultObserve).toBeCalledWith('a.d.c', expect.any(Function));

        defaultObserve.mockClear();

        proxy.stopObserving('asdf', 0, defaultObserve);
        expect(defaultObserve).toBeCalledWith('a.d.c', 0);
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
                'personalData.name.firstName': 'registeredUser.name',
                'personalData.name.lastName': 'registeredUser.surname',
                'personalData.birthday': 'dateOfBirth',
                registrationDate: 'registeredUser.dates.registration',
            },
            'registeredUser'
        );

        const observers: Observer<unknown>[] = [];

        const defaultObserve = jest.fn((_, observer) => observers.push(observer));
        const observer = jest.fn();

        proxy.observe('registeredUser.personalData.name.firstName', observer, defaultObserve);
        expect(defaultObserve).toBeCalledWith('registeredUser.name', expect.any(Function));

        defaultObserve.mockClear();

        proxy.observe('registeredUser.personalData.name', observer, defaultObserve);
        expect(defaultObserve).toBeCalledWith('registeredUser', expect.any(Function));

        defaultObserve.mockClear();

        proxy.observe('registeredUser.personalData', observer, defaultObserve);
        expect(defaultObserve).toBeCalledWith('', expect.any(Function));

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
                'info.truckNo': 'truck.plate_no',
                'info.trailerNo': 'trailer.plate_no',
                'owner.contacts[0].name': 'contact_name',
                'owner.contacts[0].contactId': 'contact_id',
                'owner.contacts[0].contactInfo.email': 'contact_email',
                'owner.contacts[0].contactInfo.phone': 'contact_phone',
            },
            'truck'
        );

        const observers: Observer<unknown>[] = [];

        const defaultObserve = jest.fn((_, observer) => observers.push(observer));
        const observer = jest.fn();

        proxy.observe('truck.owner.contacts[0]', observer, defaultObserve);
        expect(defaultObserve).toBeCalledWith('', expect.any(Function));

        defaultObserve.mockClear();

        proxy.observe('truck.info', observer, defaultObserve);
        expect(defaultObserve).toBeCalledWith('', expect.any(Function));

        observers[0](rawData);
        expect(observer).toBeCalledWith(fullData.truck.owner.contacts[0]);

        observer.mockClear();

        observers[1](rawData);
        expect(observer).toBeCalledWith(fullData.truck.info);
    });

    it('should set proxied value', () => {
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

        console.log(rawData);

        const proxy = new MappingProxy(
            {
                'personalData.name.firstName': 'registeredUser.name',
                'personalData.name.lastName': 'registeredUser.surname',
                'personalData.birthday': 'dateOfBirth',
                registrationDate: 'registeredUser.dates.registration',
            },
            'registeredUser'
        );

        const defaultSetValue = jest.fn();

        proxy.setValue('registeredUser.personalData.name.firstName', 'Hello', defaultSetValue);

        expect(defaultSetValue).toBeCalledWith('registeredUser.name', 'Hello');

        defaultSetValue.mockClear();

        proxy.setValue('registeredUser.personalData.name', { firstName: 'As', lastName: 'Df' }, defaultSetValue);

        expect(defaultSetValue).toBeCalledWith('registeredUser.name', 'As');
        expect(defaultSetValue).toBeCalledWith('registeredUser.surname', 'Df');
    });
});
