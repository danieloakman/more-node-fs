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
   * Note: the paths inside of a directory will still come before the directory itself, no matter
   * what the comparison function does. For example:
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
 * called recursively.
 * @param path The starting path.
 * @param callback Called for each path found inside the path parameter. Can be an async function.
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
 * called recursively.
 * @param path The starting path.
 * @param callback Called for each path found inside the path parameter.
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
 * @param path The path to read inside of.
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
 * Syncronously reads and returns all file and folder paths inside of the path parameter.
 * @param path The path to read inside of.
 * @returns Every path inside of the path parameter seperated into files, directories, and anything
 * else is put in the others property.
 */
export function readdirDeepSync (
  path: string,
  options: PathOptions = {}
): ReaddirResult {
  const result = new ReaddirResult();
  forEachPathSync(path, (pathInFolder, stats) => {
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
 * Asynchronously deletes files and folders/directories. If path is to a directory then it will
 * recursively delete all files within it first and then delete the directory itself.
 * @param path Path to the file or directory.
 */
export async function deleteDeep (path: string): Promise<void> {
  await forEachPath(path, async (pathInFolder, stats) => {
    if (stats.isDirectory())
      await rmdir(pathInFolder);
    else
      await unlink(pathInFolder);
  });
}

/**
 * Synchronously deletes files and folders/directories. If path is to a directory then it will
 * recursively delete all files within it first and then delete the directory itself.
 * @param path Path to the file or directory.
 */
export function deleteDeepSync (path: string): void {
  forEachPathSync(path, (pathInFolder, stats) => {
    if (stats.isDirectory())
      fs.rmdirSync(pathInFolder);
    else
      fs.unlinkSync(pathInFolder);
  });
}
