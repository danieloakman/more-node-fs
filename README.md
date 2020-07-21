# More-Node-FS

A utility which adds some more File System functions for NodeJS. It's written in typescript and is well documented with types and descriptions. There are synchronous and asynchronous versions of each function. Note the synchronous versions are faster but the asynchronous versions are still provided for cases like running in a server, etc. There are extra options for filtering paths using regular expressions and also sorting the order of them as well.

## Documentation

### forEachPath & forEachPathSync

This recursively loops through all files and directories within or at the specified path and calls the callback given for each of them.

```js
(async () => {
  const { forEachPath, forEachPathSync } = require('more-node-fs');

  // Will log all png files within the somewhere directory:
  await forEachPath('./path/to/somewhere', (path, stats) => {
    if (stats.isFile() && /\.png$/i.test(path))
      console.log(path);
  });

  // Will log all pdf files within the else directory:
  forEachPathSync('./path/to/somewhere/else', (path, stats) => {
    if (stats.isFile() && /\.pdf$/i.test(path))
      console.log(path);
  });
})();
```

### readdirDeep & readdirDeepSync

Recursively finds all files, directories and other files and stores them into seperate properties.

```js
(async () => {
  const { readdir, readdirSync } = require('more-node-fs');

  const { files, dirs, others } = await readdir('path/to/somewhere');
  // or:
  const { files, dirs, others } = readdirSync('some/other/path');
})();
```

### deleteDeep & deleteDeepSync

Deletes files and directories. If a directory is specified then it will recursively delete everything inside of it as well.

```js
(async () => {
  const { deleteDeep, deleteDeepSync } = require('more-node-fs');

  await deleteDeep('path/to/somewhere');
  // or:
  deleteDeepSync('some/other/path');
})();
```
