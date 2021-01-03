import 'react-app-polyfill/ie11';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Link, Route } from 'react-router-dom';
import { StockExample } from './components/StockExample';
import { ProxyExample } from './components/ProxyExample/ProxyExample';

const App = () => {
    return (
        <BrowserRouter>
            <menu>
                <li>
                    <Link to="/StockExample">Stock example</Link>
                </li>
                <li>
                    <Link to="/ProxyExample">Proxy example</Link>
                </li>
            </menu>

            <Route path="/StockExample">
                <StockExample />
            </Route>
            <Route path="/ProxyExample">
                <ProxyExample />
            </Route>
        </BrowserRouter>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
