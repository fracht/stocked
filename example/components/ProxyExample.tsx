import React from 'react';
import { MappingProxy, ProxyContext, StockRoot, useAllStockValues, useStockState } from 'stocked';

type FieldProps = {
    name: string;
    label: string;
    type?: string;
};

const Field = ({ name, label, type = 'text' }: FieldProps) => {
    const [value, setValue] = useStockState<string>(name);

    return (
        <div>
            <label htmlFor={name}>{label}:</label>
            <input id={name} type={type} value={value} onChange={e => setValue(e.target.value)} />
        </div>
    );
};

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
    return (
        <div>
            <h3>Actual "stocked" values changes</h3>
            <Field name="userInfo.user.firstName" label="First name (userInfo.user.firstName)" />
            <Field name="userInfo.user.lastName" label="Last name (userInfo.user.lastName)" />
            <Field name="regNo" label="Registration number (regNo)" type="number" />
        </div>
    );
};

const UserInfoForm = () => {
    return (
        <div>
            <form style={{ display: 'flex', flexDirection: 'column' }}>
                <h3>Casted values to another shape</h3>
                <Field name="userInfo.name" label="Name (userInfo.name)" />
                <Field name="userInfo.surname" label="Surname (userInfo.surname)" />
                <Field name="userInfo.regData.no" label="Registration number (userInfo.regData.no)" type="number" />
            </form>
        </div>
    );
};
