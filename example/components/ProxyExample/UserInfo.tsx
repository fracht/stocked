import React from 'react';
import { useStockValue } from 'stocked';

const UserInfo = () => {
    const name = useStockValue<string>('userInfo.user.firstName');
    const surname = useStockValue<string>('userInfo.user.lastName');
    const regNo = useStockValue<number>('regNo');
    return (
        <div>
            <h3>Actual "stocked" values changes after form was submitted</h3>
            <div>Values in another component (not proxied):</div>
            <div>name: {name}</div>
            <div>surname: {surname}</div>
            <div>regNo: {regNo}</div>
        </div>
    );
};

export default UserInfo;
