---
sidebar_position: 3
---

# Managing state

Let's provide initial state for the stock root component

```jsx title=./src/App.js
import { StockRoot } from 'stocked';

function App() {
    return (
        <StockRoot
            initialValues={{
                // highlight-start
                todos: [],
                filters: {},
                // highlight-end
            }}
        >
            <h1>Todo list!</h1>
        </StockRoot>
    );
}

export default App;
```
