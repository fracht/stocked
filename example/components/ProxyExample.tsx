import React from 'react';
import { MappingProxy, ProxyContext, StockRoot, useAllStockValues, useStockState } from 'stocked';

interface ProxiedUserInfo {
    name: string;
    surname: string;
    regData: {
        no: number;
        registrationDate: Date;
    };
}

interface RealValues {
    countryName: string;
    userInfo: {
        user: {
            firstName: string;
            lastName: string;
        };
        regDate: Date;
    };
    regNo: number;
    companyInfo: {
        name: string;
        foundationYear: number;
    };
}

const proxyContext = new MappingProxy(
    {
        name: 'userInfo.user.firstName',
        surname: 'userInfo.user.lastName',
        'regData.no': 'regNo',
        'regData.registrationDate': 'userInfo.regDate',
    },
    'userInfo'
);
proxyContext.activate();

const initialValues: RealValues = {
    countryName: 'USA',
    userInfo: {
        user: {
            firstName: 'Alex',
            lastName: 'Shukel',
        },
        regDate: new Date(),
    },
    regNo: 123,
    companyInfo: {
        name: 'IMicrosoft',
        foundationYear: 2020,
    },
};

export const ProxyExample = () => {
    return (
        <StockRoot initialValues={initialValues}>
            <h1>Proxy example</h1>
            <ProxyContext.Provider value={proxyContext}>
                <UserInfoForm />
            </ProxyContext.Provider>
            <UserInfo />
        </StockRoot>
    );
};

const UserInfo = () => {
    const {
        userInfo: {
            user: { firstName, lastName },
        },
        regNo,
    } = useAllStockValues<RealValues>();

    return (
        <div>
            <h3>Actual "stocked" values changes</h3>
            <div>Values in another component (not proxied):</div>
            <div>name: {firstName}</div>
            <div>surname: {lastName}</div>
            <div>regNo: {regNo}</div>
        </div>
    );
};

const UserInfoForm = () => {
    // This form uses proxied paths
    const [name, setName] = useStockState<string>('userInfo.name');
    const [surname, setSurname] = useStockState<string>('userInfo.surname');
    const [regNo, setRegNo] = useStockState<number>('userInfo.regData.no');

    return (
        <div>
            <form
                style={{ display: 'flex', flexDirection: 'column' }}
                onSubmit={e => {
                    e.preventDefault();
                    setName(name);
                    setSurname(surname);
                    setRegNo(regNo);
                }}
            >
                <h3>Form uses proxied values</h3>
                <div>
                    <label htmlFor="name">Name:</label>
                    <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} />
                </div>

                <div>
                    <label htmlFor="surname">Surname:</label>
                    <input id="surname" type="text" value={surname} onChange={e => setSurname(e.target.value)} />
                </div>

                <div>
                    <label htmlFor="regNo">Registration number:</label>
                    <input id="regNo" type="number" value={regNo} onChange={e => setRegNo(+e.target.value)} />
                </div>

                <button style={{ width: 100 }} type="submit">
                    Submit
                </button>
            </form>
        </div>
    );
};
