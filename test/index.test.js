'use strict';
const moreNodeFS = require('../dist/index');
const { join } = require('path');
const {
  ok: assert,
  deepStrictEqual: equal
} = require('assert');
const fs = require('fs');

const IGNORE_REGEX = /node_modules/i;
const STARTING_PATH = join(__dirname, '../');

function randName () {
  return Math.random().toString();
}

function randInt (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function createRandomFiles (path, numOfFiles, numOfDirs) {
  if (!fs.existsSync(path))
    fs.mkdirSync(path);
  for (let i = 0; i < numOfFiles; i++)
    fs.writeFileSync(join(path, randName()), 'something');
  for (let i = 0; i < numOfDirs; i++)
    createRandomFiles(join(path, randName()), randInt(1, 10), numOfDirs - 1);
}

describe('javascript', async () => {
  it('forEachPath', async () => {
    const paths = [];
    await moreNodeFS.forEachPath(STARTING_PATH, path => {
      paths.push(path);
    }, {
      ignore: IGNORE_REGEX,
      sort: (a, b) => {
        if (a > b)
          return -1;
        if (a < b)
          return 1;
        return 0;
      }
    });
    assert(paths.length);
  });

  it('forEachPathSync', () => {
    const paths = [];
    moreNodeFS.forEachPathSync(STARTING_PATH, path => {
      paths.push(path);
    }, { ignore: IGNORE_REGEX });
    assert(paths.length);
  });

  it('readdirDeep', async () => {
    const result = await moreNodeFS.readdirDeep(STARTING_PATH, { ignore: IGNORE_REGEX });
    assert(result.files.length);
  });

  it('readdirDeepSync', () => {
    const result = moreNodeFS.readdirDeepSync(STARTING_PATH, { ignore: IGNORE_REGEX });
    assert(result.files.length);
    const result2 = moreNodeFS.readdirDeepSync(STARTING_PATH, {
      ignore: IGNORE_REGEX,
      sort: (a, b) => {
        if (a > b)
          return -1;
        if (a < b)
          return 1;
        return 0;
      }
    });
    assert(result2.files.length);
  });

  it('deleteDeep', async () => {
    const tempdir = join(__dirname, 'tempdir1');
    createRandomFiles(tempdir, randInt(1, 5), 3);
    await moreNodeFS.deleteDeep(tempdir);
    assert(!fs.existsSync(tempdir));
  }).slow(1000);

  it('deleteDeepSync', () => {
    const tempdir = join(__dirname, 'tempdir2');
    createRandomFiles(tempdir, randInt(1, 5), 3);
    moreNodeFS.deleteDeepSync(tempdir);
    assert(!fs.existsSync(tempdir));
  }).slow(1000);

  it('walkdir', () => {
    const paths = [...moreNodeFS.walkdir(STARTING_PATH, {
      ignore: IGNORE_REGEX, sort: (a, b) => a > b ? -1 : (a < b ? 1 : 0)
    })];
    assert(paths.length);

    const paths2 = [];
    for (const { path } of moreNodeFS.walkdir('./nowhere')) {
      paths2.push(path);
    }
    equal(paths2.length, 0);
    for (const { path } of moreNodeFS.walkdir(join(process.cwd(), 'LICENSE'))) {
      paths2.push(path);
    }
    assert(paths2.length, 1);
    for (const { path } of moreNodeFS.walkdir(join(process.cwd(), 'LICENSE'), { search: 'dfs' })) {
      paths2.push(path);
    }
    assert(paths2.length, 2);
  });

  it('results are the same', async () => {
    const forEachPathResult = [];
    await moreNodeFS.forEachPath(
      STARTING_PATH, path => forEachPathResult.push(path), { ignore: IGNORE_REGEX }
    );

    const forEachPathSyncResult = [];
    moreNodeFS.forEachPathSync(
      STARTING_PATH, path => forEachPathSyncResult.push(path), { ignore: IGNORE_REGEX }
    );

    let readdirDeepResult;
    {
      const { files, dirs, others } = await moreNodeFS.readdirDeep(
        STARTING_PATH, { ignore: IGNORE_REGEX }
      );
      readdirDeepResult = [...files, ...dirs, ...others];
    }

    let readdirDeepSyncResult;
    {
      const { files, dirs, others } = moreNodeFS.readdirDeepSync(
        STARTING_PATH, { ignore: IGNORE_REGEX }
      );
      readdirDeepSyncResult = [...files, ...dirs, ...others];
    }

    const walkdirResult = [];
    for (const { path } of moreNodeFS.walkdir(STARTING_PATH, { ignore: IGNORE_REGEX })) {
      walkdirResult.push(path);
    }

    assert(
      [
        forEachPathResult.length,
        forEachPathSyncResult.length,
        readdirDeepResult.length,
        readdirDeepSyncResult.length
      ].every(length => length === walkdirResult.length)
    )
    for (const path of walkdirResult) {
      assert(
        forEachPathResult.includes(path) && forEachPathSyncResult.includes(path) &&
        readdirDeepResult.includes(path) && readdirDeepSyncResult.includes(path)
      );
    }
  }).timeout(10000);
});
