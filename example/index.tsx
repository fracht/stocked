import React from 'react';
import { BrowserRouter, Link, Route } from 'react-router-dom';
import ReactDOM from 'react-dom';

import 'react-app-polyfill/ie11';

import { ProxyExample } from './components/ProxyExample';
import { StockExample } from './components/StockExample';

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
