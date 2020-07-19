'use strict';
import { forEachPathSync } from '../dist/index';
import { join } from 'path';

const paths = [];
const symbolicLinks = [];
forEachPathSync(join(__dirname, '../'), (path, stats) => {
  if (stats.isSymbolicLink())
    symbolicLinks.push(path);
  else
    paths.push(path);
});
console.log('number of paths:', paths.length);
