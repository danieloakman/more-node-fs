'use strict';
const Benchmark = require('benchmark');
const { handleStartEvent, handleCycleEvent, handleCompleteEvent } = require('./benchmarkUtil');
const { join } = require('path');
const { forEachPathSync, walkdir, readdirDeepSync } = require('../dist/index');

const IGNORE_REGEX = /\.git|node_modules/i;
const STARTING_PATH = join(__dirname, '../');

new Benchmark.Suite('index')
  .on('start', handleStartEvent)
  .on('cycle', handleCycleEvent)
  .on('complete', handleCompleteEvent)
  .add('forEachPathSync', () => {
    const result = [];
    forEachPathSync(STARTING_PATH, path => {
      result.push(path);
    }, { ignore: IGNORE_REGEX });
  })
  .add('readdirDeepSync', () => {
    const result = readdirDeepSync(STARTING_PATH, { ignore: IGNORE_REGEX });
  })
  .add('walkdir', () => {
    const result = [];
    for (const { path } of walkdir(STARTING_PATH, { ignore: IGNORE_REGEX })) {
      result.push(path);
    }
  })
  // .add('spread walkdir', () => {
  //   const result = [...walkdir(STARTING_PATH, { ignore: IGNORE_REGEX })];
  // })
  .run();
