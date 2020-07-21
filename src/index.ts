import fs from 'fs';
import { join } from 'path';
import { promisify } from 'util';

// Promisified versions of asynchronous fs functions that take a callback.
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);

/**
 * Asyncronously loop through all paths found in or at the path parameter. This function is
 * called recursively.
 * @param path The starting path.
 * @param callback Called for each path found inside the path parameter. Can be an async function.
 * @param options Optional parameters:
 *  - ignore: If specified, then will not look at paths that match this regex.
 * @note This is about ~30% slower compared to the synchronous version of this function. So use
 * that instead of this unless it's necessary.
 */
export async function forEachPath (
  path: string,
  callback: (path: string, stats: fs.Stats) => void,
  options: { ignore?: RegExp } = {}
) {
  if (!fs.existsSync(path) || (options.ignore instanceof RegExp && options.ignore.test(path)))
    return;

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
 */
export function forEachPathSync (
  path: string,
  callback: (path: string, stats: fs.Stats) => void,
  options: { ignore?: RegExp } = {}
) {
  if (!fs.existsSync(path) || (options.ignore instanceof RegExp && options.ignore.test(path)))
    return;

  const stats = fs.lstatSync(path);
  if (stats.isDirectory())
    for (const pathInFolder of fs.readdirSync(path))
      forEachPathSync(join(path, pathInFolder), callback, options);
  callback(path, stats);
}

/**
 * Asyncronously reads and returns all file and folder paths inside of the path parameter.
 * @param path The path to read inside of.
 * @param options Optional parameters:
 *  - ignore: If specified, then will not look at paths that match this regex.
 * @returns Every path inside of the path parameter seperated into files, directories, and anything
 * else is put in the others property.
 * @note This is about ~30% slower compared to the synchronous version of this function. So use
 * that instead of this unless it's necessary.
 */
export async function readdirDeep (
  path: string,
  options: { ignore?: RegExp } = {}
): Promise<{ files: string[], dirs: string[], others: string[] }> {
  const result = { files: [], dirs: [], others: [] };
  await forEachPath(path, async pathInFolder => {
    const stats = await stat(pathInFolder);
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
 * @returns Every path inside of the path parameter seperated into files, directories, and anything
 * else is put in the others property.
 */
export function readdirDeepSync (
  path: string,
  options: { ignore?: RegExp } = {}
): { files: string[], dirs: string[], others: string[] } {
  const result = { files: [], dirs: [], others: [] };
  forEachPathSync(path, pathInFolder => {
    const stats = fs.statSync(pathInFolder);
    if (stats.isFile())
      result.files.push(pathInFolder);
    else if (stats.isDirectory())
      result.dirs.push(pathInFolder);
    else
      result.others.push(pathInFolder);
  }, options);
  return result;
}
