# Why this?
Need a playground with minimal dependencies to test db designs and debug mongoose

## Install
```sh
yarn
```

By default it will use `mongodb-memory-server`, no need to configure mongodb

In case you want to interact with a normal `mongodb`, run

```sh
yarn docker
```

It will start a local mongodb for you

## How to use
1. Use VScode open index.js and edit your test cases
2. Set breakpoints/console.log
3. Press F5 to inspect the results

There are 2 debuger configurations, one uses `mongodb-memory-server`, another uses docker `mongodb`.
