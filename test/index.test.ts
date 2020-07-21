import * as moreNodeFS from '../dist/index';
import { join } from 'path';
const {
  ok: assert
  // deepStrictEqual: equal
} = require('assert');

const IGNORE_REGEX = /\.git|node_modules/i;
const STARTING_PATH = join(__dirname, '../');

describe('typescript', async () => {
  it('forEachPath', async () => {
    const paths = [];
    await moreNodeFS.forEachPath(STARTING_PATH, path => {
      paths.push(path);
    }, { ignore: IGNORE_REGEX });
    assert(paths.length);
  });

  it('forEachPathSync', () => {
    const paths = [];
    moreNodeFS.forEachPathSync(STARTING_PATH, path => {
      paths.push(path);
    }, { ignore: IGNORE_REGEX });
    assert(paths.length);
  });

  it('mapPath', async () => {
    const paths = await moreNodeFS.mapPath(
      STARTING_PATH,
      path => path + 'do something',
      { ignore: IGNORE_REGEX }
    );
    assert(paths.length && paths.every(path => path.includes('do something')));
  });

  it('mapPathSync', () => {
    const paths = moreNodeFS.mapPathSync(
      STARTING_PATH,
      path => path + 'do something',
      { ignore: IGNORE_REGEX }
    );
    assert(paths.length && paths.every(path => path.includes('do something')));
  });

  it('readdirDeep', async () => {
    const result = await moreNodeFS.readdirDeep(STARTING_PATH, { ignore: IGNORE_REGEX });
    assert(result.files.length);
  });

  it('readdirDeepSync', () => {
    const result = moreNodeFS.readdirDeepSync(STARTING_PATH, { ignore: IGNORE_REGEX });
    assert(result.files.length);
  });
});
