
# More-Node-FS

A utility which adds some more File System functions for NodeJS. It's written in typescript and is well documented with types and descriptions. There are synchronous and asynchronous versions of each function. Note the synchronous versions are faster but the asynchronous versions are still provided for cases like running in a server, etc. There are extra options for filtering paths using regular expressions and also sorting the order of them as well.

## List Of Features

- forEachPath & forEachPathSync:
Recursively loop through all files and directories within or at the specified path and calls the callback given for each of them. Uses depth first search.
- readdirDeep & readdirDeepSync:
Recursively finds all files, directories and other files and stores them into separate properties.
- deleteDeep & deleteDeepSync:
Deletes files and directories. If a directory is specified then it will recursively delete everything inside of it as well.
- walkdir: Generator function that iterates through a directory and any sub directories. Unlike the other functions, this uses breadth first search.
- Extra options available to forEachPath, readdirDeep and walkdir:
  - ignore: If specified, then will not look at paths that match this regex. This and the match option can significantly speed up path searches.
  - match: If specified, then will only look at paths that match this regex.
  - sort: Specify a comparison function that is used when sorting each found directory. Note: the paths inside of a directory will still come before the directory itself, no matter what the comparison function does. For example: ['somedir/fileA', 'somedir/fileB', 'somedir/fileC', 'somedir/'].

## Code Demo

```js
const { forEachPathSync, walkdir } = require('more-node-fs');

// Find all png files within a directory:
const images = [];
forEachPathSync('./path/to/somewhere', (path, stats) => {
  if (stats.isFile() &&  /\.png$/i.test(path))
    images.push(path);
});

// Same thing but using walkdir:
const images2 = [];
for (const { stats, path } of walkdir('./path/to/somewhere')) {
  if (stats.isFile() &&  /\.png$/i.test(path))
    images2.push(path);
}
```

## Benchmark

`forEachPathSync x 394 ops/sec, ±3 ops/sec or ±0.85% (90 runs sampled)`
`readdirDeepSync x 401 ops/sec, ±1 ops/sec or ±0.37% (92 runs sampled)`
`walkdir x 897 ops/sec, ±5 ops/sec or ±0.58% (91 runs sampled)`

## Authors or Acknowledgments

Daniel Oakman

## License

This project is licensed under the ISC License
