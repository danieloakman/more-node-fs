'use strict';
const { forEachPathSync } = require('../dist/index');
const { join } = require('path');

const paths = [];
forEachPathSync(join(__dirname, '../'), path => {
    paths.push(path);
});
console.log('number of paths:', paths.length);
