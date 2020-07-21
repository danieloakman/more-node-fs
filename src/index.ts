import fs from 'fs';
import { join } from 'path';
import { promisify } from 'util';

// Promisified versions of asynchronous fs functions that take a callback.
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);

/**
 * Asyncronously loop through all paths found in or at the path parameter. This function is
 * called recursively.
 * @param path The starting path.
 * @param callback Called for each path found inside the path parameter. Can be an async function.
 * @param options Optional parameters:
 *  - ignore: If specified, then will not look at paths that match this regex.
 *  - match: If specified, then will only look at paths that match this regex.
 */
export async function forEachPath (
  path: string,
  callback: (path: string, stats: fs.Stats) => void,
  options: { ignore?: RegExp, match?: RegExp } = {}
) {
  if (
    !fs.existsSync(path) ||
    (options.ignore instanceof RegExp && options.ignore.test(path)) ||
    (options.match instanceof RegExp && !options.match.test(path))
  ) return;

  const stats = await stat(path);
  if (stats.isDirectory())
    for (const pathInFolder of (await readdir(path)))
      await forEachPath(join(path, pathInFolder.toString()), callback, options);
  await callback(path, stats);
}

/**
 * Synchronously loop through all paths found in or at the path parameter. This function is
 * called recursively.
 * @param path The starting path.
 * @param callback Called for each path found inside the path parameter.
 * @param options Optional parameters:
 *  - ignore: If specified, then will not look at paths that match this regex.
 *  - match: If specified, then will only look at paths that match this regex.
 */
export function forEachPathSync (
  path: string,
  callback: (path: string, stats: fs.Stats) => void,
  options: { ignore?: RegExp, match?: RegExp } = {}
) {
  if (
    !fs.existsSync(path) ||
    (options.ignore instanceof RegExp && options.ignore.test(path)) ||
    (options.match instanceof RegExp && !options.match.test(path))
  ) return;

  const stats = fs.lstatSync(path);
  if (stats.isDirectory())
    for (const pathInFolder of fs.readdirSync(path))
      forEachPathSync(join(path, pathInFolder), callback, options);
  callback(path, stats);
}

/**
 * Asyncronously loop through all paths found in or at the path parameter and return each
 * element that is returned inside the callback parameter. This function is called recursively.
 * @param path The starting path.
 * @param callback Called for each path found inside the path parameter. Can be
 * and async function.
 * @param options Optional parameters:
 *  - ignore: If specified, then will not look at paths that match this regex.
 *  - match: If specified, then will only look at paths that match this regex.
 */
export async function mapPath (
  path: string,
  callback: (path: string, stats: fs.Stats) => void,
  options: { ignore?: RegExp, match?: RegExp } = {}
): Promise<string[]> {
  const result = [];
  await forEachPath(path, async (pathInFolder, stats) => {
    result.push((await callback(pathInFolder, stats)));
  }, options);
  return result;
}

/**
 * Syncronously loop through all paths found in or at the path parameter and return each
 * element that is returned inside the callback parameter. This function is called recursively.
 * @param path The starting path.
 * @param callback Called for each path found inside the path parameter.
 * @param options Optional parameters:
 *  - ignore: If specified, then will not look at paths that match this regex.
 *  - match: If specified, then will only look at paths that match this regex.
 */
export function mapPathSync (
  path: string,
  callback: (path: string, stats: fs.Stats) => void,
  options: { ignore?: RegExp, match?: RegExp } = {}
): string[] {
  const result = [];
  forEachPathSync(path, (pathInFolder, stats) => {
    result.push(callback(pathInFolder, stats));
  }, options);
  return result;
}

/**
 * Asyncronously reads and returns all file and folder paths inside of the path parameter.
 * @param path The path to read inside of.
 * @param options Optional parameters:
 *  - ignore: If specified, then will not look at paths that match this regex.
 *  - match: If specified, then will only look at paths that match this regex.
 * @returns Every path inside of the path parameter seperated into files, directories, and anything
 * else is put in the others property.
 */
export async function readdirDeep (
  path: string,
  options: { ignore?: RegExp, match?: RegExp } = {}
): Promise<{ files: string[], dirs: string[], others: string[] }> {
  const result = { files: [], dirs: [], others: [] };
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
 * @param options Optional parameters:
 *  - ignore: If specified, then will not look at paths that match this regex.
 *  - match: If specified, then will only look at paths that match this regex.
 * @returns Every path inside of the path parameter seperated into files, directories, and anything
 * else is put in the others property.
 */
export function readdirDeepSync (
  path: string,
  options: { ignore?: RegExp, match?: RegExp } = {}
): { files: string[], dirs: string[], others: string[] } {
  const result = { files: [], dirs: [], others: [] };
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
