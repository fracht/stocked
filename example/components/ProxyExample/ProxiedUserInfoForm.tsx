import React, { useState } from 'react';
import { ProxyContext, useStockContext } from 'stocked';
import { proxyContext } from './ProxyExample';

const UserInfoForm = () => {
    // Get proxied context (ProxyContext)
    const { getValue, setValue } = useStockContext();

    // Proxied paths to values
    const proxiedNamePath = 'userInfo.name';
    const proxiedSurnamePath = 'userInfo.surname';
    const proxiedRegNoPath = 'userInfo.regData.no';

    // States for values in form
    const [name, setName] = useState<string>(getValue<string>(proxiedNamePath));
    const [surname, setSurname] = useState<string>(getValue<string>(proxiedSurnamePath));
    const [regNo, setRegNo] = useState<number>(getValue<number>(proxiedRegNoPath));

    return (
        <div>
            <form
                style={{ display: 'flex', flexDirection: 'column' }}
                onSubmit={e => {
                    e.preventDefault();
                    setValue(proxiedNamePath, name);
                    setValue(proxiedSurnamePath, surname);
                    setValue(proxiedRegNoPath, regNo);
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

const ProxiedUserInfoForm = () => {
    proxyContext.activate();
    return (
        <ProxyContext.Provider value={proxyContext}>
            <UserInfoForm />
        </ProxyContext.Provider>
    );
};

export default ProxiedUserInfoForm;
