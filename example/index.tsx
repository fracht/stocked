import 'react-app-polyfill/ie11';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Link, Route } from 'react-router-dom';
import { Example1 } from './components/Example1';
import { ProxyExample } from './components/ProxyExample/ProxyExample';

const App = () => {
    return (
        <BrowserRouter>
            <menu>
                <div>
                    <Link to="/StockExample">Stock example</Link>
                </div>
                <div>
                    <Link to="/ProxyExample">Proxy example</Link>
                </div>
            </menu>

            <Route path="/StockExample">
                <Example1 />
            </Route>
            <Route path="/ProxyExample">
                <ProxyExample />
            </Route>
        </BrowserRouter>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
