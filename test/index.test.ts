import * as moreNodeFS from '../dist/index';
import { join } from 'path';
const {
  ok: assert
  // deepStrictEqual: equal
} = require('assert');

describe('typescript', async () => {
  it('forEachPath', async () => {
    const paths = [];
    await moreNodeFS.forEachPath(join(__dirname, '../'), (path, stats) => {
      paths.push(path);
    });
    assert(paths.length > 0);
  });

  it('forEachPathSync', () => {
    const paths = [];
    moreNodeFS.forEachPathSync(join(__dirname, '../'), (path, stats) => {
      paths.push(path);
    });
    assert(paths.length > 0);
  });

  it('readdirDeep', async () => {
    const result = await moreNodeFS.readdirDeep(join(__dirname, '../'));
    assert(result.files.length > 0);
  });

  it('readdirDeepSync', () => {
    const result = moreNodeFS.readdirDeepSync(join(__dirname, '../'));
    assert(result.files.length > 0);
  });
});
