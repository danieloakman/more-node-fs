import fs from 'fs';
import { join } from 'path';
import { promisify } from 'util';

// Promisified versions of asynchronous fs functions that take a callback.
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);

interface PathOptions {
  /** If specified, then will not look at paths that match this regex. */
  ignore?: RegExp;

  /** If specified, then will only look at paths that match this regex. */
  match?: RegExp;

  /**
   * Specify a comparison function that is used when sorting each found directory.
   * Note: this doesn't affect the search order, i.e. breadth first or depth first. It only sorts
   * each directory separately. For example:
   * ['somedir/fileA', 'somedir/fileB', 'somedir/fileC', 'somedir/']
   */
  sort?: (a: string, b: string) => number;
}

class ReaddirResult {
  files: string[];
  dirs: string[];
  others: string[];
  constructor () {
    this.files = [];
    this.dirs = [];
    this.others = [];
  }
}

/**
 * Asyncronously loop through all paths found in or at the path parameter. This function is
 * called recursively. Uses depth first search.
 * @param path The starting path.
 * @param callback Called for each path found inside the path parameter. Can be an async function.
 * @param options Path options.
 */
export async function forEachPath (
  path: string,
  callback: (path: string, stats: fs.Stats) => void,
  options: PathOptions = {}
) {
  if (
    !fs.existsSync(path) ||
    (options.ignore instanceof RegExp && options.ignore.test(path)) ||
    (options.match instanceof RegExp && !options.match.test(path))
  ) return;

  const stats = await stat(path);
  if (stats.isDirectory()) {
    const dir = await readdir(path);
    if (options.sort instanceof Function)
      dir.sort(options.sort);
    for (const pathInDir of dir)
      await forEachPath(join(path, pathInDir.toString()), callback, options);
  }
  await callback(path, stats);
}

/**
 * Synchronously loop through all paths found in or at the path parameter. This function is
 * called recursively. Uses depth first search.
 * @param path The starting path.
 * @param callback Called for each path found inside the path parameter.
 * @param options Path options.
 */
export function forEachPathSync (
  path: string,
  callback: (path: string, stats: fs.Stats) => void,
  options: PathOptions = {}
) {
  if (
    !fs.existsSync(path) ||
    (options.ignore instanceof RegExp && options.ignore.test(path)) ||
    (options.match instanceof RegExp && !options.match.test(path))
  ) return;

  const stats = fs.lstatSync(path);
  if (stats.isDirectory()) {
    const dir = fs.readdirSync(path);
    if (options.sort instanceof Function)
      dir.sort(options.sort);
    for (const pathInFolder of dir)
      forEachPathSync(join(path, pathInFolder), callback, options);
  }
  callback(path, stats);
}

/**
 * Asyncronously reads and returns all file and folder paths inside of the path parameter.
 * Internally this uses forEachPath.
 * @param path The path to read inside of.
 * @param options Path options.
 * @returns Every path inside of the path parameter seperated into files, directories, and anything
 * else is put in the others property.
 */
export async function readdirDeep (
  path: string,
  options: PathOptions = {}
): Promise<ReaddirResult> {
  const result = new ReaddirResult();
  await forEachPath(path, async (pathInFolder, stats) => {
    if (stats.isFile())
      result.files.push(pathInFolder);
    else if (stats.isDirectory())
      result.dirs.push(pathInFolder);
    else
      result.others.push(pathInFolder);
  }, options);
  return result;
}

/**
 * Syncronously reads and returns all file and folder paths inside of the path parameter. Internally
 * this uses walkdir.
 * @param path The path to read inside of.
 * @param options Path options.
 * @returns Every path inside of the path parameter seperated into files, directories, and anything
 * else is put in the others property.
 */
export function readdirDeepSync (
  path: string,
  options: PathOptions = {}
): ReaddirResult {
  const result = new ReaddirResult();
  for (const { stats, path: pathInFolder } of walkdir(path, options)) {
    if (stats.isFile())
      result.files.push(pathInFolder);
    else if (stats.isDirectory())
      result.dirs.push(pathInFolder);
    else
      result.others.push(pathInFolder);
  }
  return result;
}

/**
 * Asynchronously deletes files and folders/directories. If path is to a directory then it will
 * recursively delete all files within it first and then delete the directory itself.
 * @param path Path to the file or directory.
 */
export async function deleteDeep (path: string): Promise<void> {
  for (const { stats, path: pathInFolder } of walkdir(path, { search: 'dfs' })) {
    if (stats.isDirectory())
      await rmdir(pathInFolder);
    else
      await unlink(pathInFolder);
  }
}

/**
 * Synchronously deletes files and folders/directories. If path is to a directory then it will
 * recursively delete all files within it first and then delete the directory itself.
 * @param path Path to the file or directory.
 */
export function deleteDeepSync (path: string): void {
  for (const { stats, path: pathInFolder } of walkdir(path, { search: 'dfs' })) {
    if (stats.isDirectory())
      fs.rmdirSync(pathInFolder);
    else
      fs.unlinkSync(pathInFolder);
  }
}

function passesRegex (path: string, options: PathOptions = {}) {
  return (!options.ignore || (options.ignore instanceof RegExp && !options.ignore.test(path))) &&
    (!options.match || (options.match instanceof RegExp && options.match.test(path)));
}

function* iterativeBFS (
  path: string,
  options: PathOptions = {}
): Generator<{
  stats: fs.Stats;
  path: string;
}, void, unknown> {
  let stats = fs.statSync(path);
  yield { stats, path };

  if (stats.isDirectory()) {
    const queue: string[] = [];
    queue.push(path);
    while (queue.length) {
      const dir = queue.shift();
      const pathsInDir = fs.readdirSync(dir);
      if (options.sort instanceof Function)
        pathsInDir.sort(options.sort);
      for (path of pathsInDir) {
        path = join(dir, path);
        if (passesRegex(path, options)) {
          stats = fs.statSync(path);
          yield { stats, path };
          if (stats.isDirectory())
            queue.push(path);
        }
      }
    }
  }
}

function* iterativeDFS (path: string,
  options: PathOptions = {}
): Generator<{
  stats: fs.Stats;
  path: string;
}, void, unknown> {
  let stats = fs.statSync(path);
  if (!stats.isDirectory()) {
    yield { stats, path };
    return;
  }

  const stack = [{ stats, path }]; // A stack for everything
  const dirStack = [{ stats, path }]; // A stack for all unvisited directories

  while (dirStack.length) {
    const dir = dirStack.pop();
    const dirStackLength = dirStack.length;
    const pathsInDir = fs.readdirSync(dir.path);
    if (options.sort instanceof Function)
      pathsInDir.sort(options.sort);
    for (path of pathsInDir) {
      path = join(dir.path, path);
      if (passesRegex(path, options)) {
        stats = fs.statSync(path);
        stack.push({ stats, path });
        if (stats.isDirectory()) {
          dirStack.push({ stats, path });
        }
      }
    }

    // If dir had no other directories inside of it:
    if (dirStack.length && dirStack.length === dirStackLength) {
      while (stack.length && stack[stack.length - 1].path !== dirStack[dirStack.length - 1].path)
        yield stack.pop();
    }
  }

  // Finish emptying the rest of the stack:
  while (stack.length)
    yield stack.pop();
}

interface WalkdirOptions extends PathOptions {
  /**
   * The type of search method to use. Either depth first search (DFS) or breadth first
   * search (BFS). BFS is default.
   */
  search?: 'dfs'|'bfs';
}

/**
 * Iterator for searching through a directory and any sub directories. Can to use either depth first
 * search of breadth first search. BFS is default.
 * @param path The starting path.
 * @param options Path options.
 */
export function walkdir (
  path: string,
  options: WalkdirOptions = { search: 'bfs' }
): Generator<{
  stats: fs.Stats;
  path: string;
}, void, unknown> {
  if (!fs.existsSync(path) || !passesRegex(path, options))
    return (function* () {})();

  if (options.search === 'dfs')
    return iterativeDFS(path, options);
  else
    return iterativeBFS(path, options);
}
