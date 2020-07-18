"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forEachPathSync = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
/**
 * Synchronously loop through all paths found in or at the path parameter. This function is
 * called recursively.
 * @param path The starting path.
 * @param callback Called for each path found inside the path parameter.
 * @param options Optional parameters:
 *  - ignore: If specified, then will not look at paths that match this regex.
 */
function forEachPathSync(path, callback, options = {}) {
    if (!fs_1.default.existsSync(path) || (options.ignore instanceof RegExp && options.ignore.test(path)))
        return;
    const stats = fs_1.default.statSync(path);
    if (stats.isFile())
        callback(path);
    else if (stats.isDirectory()) {
        for (const pathInFolder of fs_1.default.readdirSync(path))
            forEachPathSync(path_1.join(path, pathInFolder), callback, options);
        callback(path);
    }
}
exports.forEachPathSync = forEachPathSync;
//# sourceMappingURL=index.js.map