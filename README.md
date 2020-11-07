
# More-Node-FS

A utility which adds some more File System functions for NodeJS. It's written in typescript and is well documented with types and descriptions. There are synchronous and asynchronous versions of each function. Note the synchronous versions are faster but the asynchronous versions are still provided for cases like running in a server, etc. There are extra options for filtering paths using regular expressions and also sorting the order of them as well.

### List Of Features

- forEachPath & forEachPathSync:
Recursively loop through all files and directories within or at the specified path and calls the callback given for each of them.
- readdirDeep & readdirDeepSync:
Recursively finds all files, directories and other files and stores them into separate properties.
- deleteDeep & deleteDeepSync:
Deletes files and directories. If a directory is specified then it will recursively delete everything inside of it as well.
- Extra options available to forEachPath & readdirDeep:
  - ignore: If specified, then will not look at paths that match this regex. This and the match option can significantly speed up path searches.
  - match: If specified, then will only look at paths that match this regex.
  - sort: Specify a comparison function that is used when sorting each found directory. Note: the paths inside of a directory will still come before the directory itself, no matter what the comparison function does. For example: ['somedir/fileA', 'somedir/fileB', 'somedir/fileC', 'somedir/'].

### Code Demo

```js
const { forEachPathSync } = require('more-node-fs');

// Find all png files within a directory:
const images = [];
forEachPathSync('./path/to/somewhere', (path, stats) => {
  if (stats.isFile() &&  /\.png$/i.test(path))
    images.push(path);
});
```

### Authors or Acknowledgments

Daniel Oakman

### License

This project is licensed under the ISC License
