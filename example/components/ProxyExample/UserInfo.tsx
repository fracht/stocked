import React from 'react';
import { useAllStockValues } from 'stocked';
import { RealValues } from './ProxyExample';

const UserInfo = () => {
    const values = useAllStockValues<RealValues>();
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
