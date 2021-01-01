import React from 'react';
import { useStockValue } from 'stocked';
import { RealValues } from './ProxyExample';

const UserInfo = () => {
    // const name = useStockValue<string>('userInfo.user.firstName');
    // const surname = useStockValue<string>('userInfo.user.lastName');
    // const regNo = useStockValue<number>('regNo');
    const values = useStockValue<RealValues>('');
    return (
        <div>
            <h3>Actual "stocked" values changes after form was submitted</h3>
            <div>Values in another component (not proxied):</div>
            <div>name: {values.userInfo.user.firstName}</div>
            <div>surname: {values.userInfo.user.lastName}</div>
            <div>regNo: {values.regNo}</div>
        </div>
    );
};

export default UserInfo;
