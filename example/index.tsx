import 'react-app-polyfill/ie11';
import React from 'react';
import ReactDOM from 'react-dom';
import { Example1 } from './components/Example1';
import { BrowserRouter, Link } from 'react-router-dom'

const App = () => {
    return (
        <BrowserRouter>
        <div>
            <header>
                <nav>
                    <Link to="/">Home</Link>
                    <Link to="/example1">Example 1</Link>
                </nav>
            </header>
            <main>
                <Example1 />
        </main>
        </div>
        </BrowserRouter>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
