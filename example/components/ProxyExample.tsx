import React from 'react';
import { StockRoot, MappingProxy, ProxyContext, useStockState } from 'stocked';

// userInformation: {
//     name: 'Nill',
//     surname: 'Johnson',
//     regData: {
//         no: 145,
//         registrationDate: new Date(),
//     },
// },

interface ProxiedUserInfo {
    userInformation: {
        name: string;
        surname: string;
        regData: {
            no: number;
            registrationDate: Date;
        };
    };
}

interface RealUserInfo {
    userInfo: {
        regNo: number;
        user: {
            firstName: string;
            lastName: string;
        };
        regDate: Date;
    };
}

// There required type is ProxiedUserInfo
const sendData = (values: ProxiedUserInfo) => console.log(values);

const UserInfoForm = () => {
    const [values, setValues] = useStockState('userInformation');
    console.log(values);
    return <div>Form</div>;
};

const ProxyProvider = () => {
    const proxyContext = new MappingProxy(
        {
            'userInformation.name': 'userInfo.user.firstName',
            'userInformation.surname': 'userInfo.user.lastName',
            'userInformation.regData.no': 'userInfo.regNo',
            'userInformation.regData.registrationDate': 'userInfo.regDate',
        },
        'userInfo'
    );

    proxyContext.activate();

    return (
        <ProxyContext.Provider value={proxyContext}>
            <UserInfoForm />
        </ProxyContext.Provider>
    );
};

const initialValues = {
    countryName: 'USA',
    userInfo: {
        regNo: 123,
        user: {
            firstName: 'Alex',
            lastName: 'Shukel',
        },
        regDate: new Date(),
    },
    companyInfo: {
        name: 'IMicrosoft',
        foundationYear: 2020,
    },
};

export const ProxyExample = () => {
    return (
        <StockRoot initialValues={initialValues}>
            <h1>Proxy example</h1>
            <ProxyProvider />
        </StockRoot>
    );
};
