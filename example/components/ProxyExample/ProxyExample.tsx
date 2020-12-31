import React from 'react';
import { StockRoot, MappingProxy } from 'stocked';
import ProxiedUserInfoForm from './ProxiedUserInfoForm';
import UserInfo from './UserInfo';

/**
 * @property {string} name                      - accordance "userInfo.user.firstName"
 * @property {string} surname                   - accordance "userInfo.user.lastName"
 * @property {number} regData.no                - accordance "userInfo.regDate"
 * @property {Date} regData.registrationDate    - accordance "regNo"
 */
interface ProxiedUserInfo {
    name: string;
    surname: string;
    regData: {
        no: number;
        registrationDate: Date;
    };
}

interface RealUserInfo {
    userInfo: {
        user: {
            firstName: string;
            lastName: string;
        };
        regDate: Date;
    };
    regNo: number;
}

// Using MappingProxy you need to define accordances between real and proxied values (see two interfaces above)
export const proxyContext = new MappingProxy(
    {
        name: 'userInfo.user.firstName',
        surname: 'userInfo.user.lastName',
        'regData.no': 'regNo',
        'regData.registrationDate': 'userInfo.regDate',
    },
    'userInfo'
);

const initialValues = {
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
            <ProxiedUserInfoForm />
            <UserInfo />
        </StockRoot>
    );
};
