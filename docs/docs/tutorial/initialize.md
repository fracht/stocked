---
sidebar_position: 2
---

# Initialize project

Let's create a new project using [create-react-app](https://github.com/facebook/create-react-app#readme) utility.

## Create React App

Run this command in your terminal

```bash
npx create-react-app my-app
```

:::tip Pro tip!

If you want to use typescript in your project, specify one more flag to the create-react-app: `--template typescript`.

:::

## Install dependencies

To install latest `stocked` stable version, run this command:

```bash
npm install stocked
```

Or, if you're using [yarn](https://github.com/yarnpkg/berry#readme):

```bash
yarn add stocked
```

## Create app state

Delete everything from your `./src/App.js` file (or `./src/App.tsx` for typescript) and wrap your app content with `StockRoot` component:

```jsx title=./src/App.js
import { StockRoot } from 'stocked';

function App() {
    return (
        <StockRoot initialValues={{}}>
            <h1>Todo list!</h1>
        </StockRoot>
    );
}

export default App;
```

And that's it! You've initialized your first app with `stocked`! Continue to the next section to complete this tutorial!
