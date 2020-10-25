import 'react-app-polyfill/ie11';
import React from 'react';
import ReactDOM from 'react-dom';
import { Example1 } from './components/Example1';

const App = () => {
    return (
        <div>
            <Example1 />
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
