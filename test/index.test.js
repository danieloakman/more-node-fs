'use strict';
const { forEachPathSync } = require('../dist/index');
const { join } = require('path');

const paths = [];
const symbolicLinks = [];
forEachPathSync(join(__dirname, '../'), (path, stats) => {
  if (stats.isSymbolicLink() || stats.is)
    symbolicLinks.push(path);
  else
    paths.push(path);
});
console.log('number of paths:', paths.length);
