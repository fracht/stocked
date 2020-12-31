import 'react-app-polyfill/ie11';
import React from 'react';
import ReactDOM from 'react-dom';
import { Example1 } from './components/Example1';
import { ProxyExample } from './components/ProxyExample';

const App = () => {
    return (
        <div>
            {/* <Example1 /> */}
            <ProxyExample />
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
