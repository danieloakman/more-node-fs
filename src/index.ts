import fs from 'fs';
import { join } from 'path';

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

  const stats = fs.statSync(path);
  if (stats.isFile())
    callback(path, stats);
  else if (stats.isDirectory()) {
    for (const pathInFolder of fs.readdirSync(path))
      forEachPathSync(join(path, pathInFolder), callback, options);
    callback(path, stats);
  } else if (stats.isSymbolicLink()) {
    callback(path, stats);
  }
}
