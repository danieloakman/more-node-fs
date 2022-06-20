
# More-Node-FS

A utility which adds some more File System functions for NodeJS. It's written in typescript and is well documented with types and descriptions. There are synchronous and asynchronous versions of each function. Note the synchronous versions are faster but the asynchronous versions are still provided for cases like running in a server, etc. There are extra options for filtering paths using regular expressions and also sorting the order of them as well.

## Code Demo

```js
const { walkdirSync } = require('more-node-fs');

// Find all png files within a directory:
const images2 = [];
for (const { path, stats } of walkdirSync('./path/to/somewhere'), { search: 'dfs' })
  if (stats.isFile() && /\.png$/i.test(path))
    images2.push(path);

```
