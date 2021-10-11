/*
 * Copyright 2021 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations
 * under the License.
 */

const fs = require('fs');
const path = require('path');

const ensureDirectoryPathExists = (pathToFolder) => {
  if (fs.existsSync(pathToFolder) === false) {
    // TODO: better folder permissions?
    fs.mkdirSync(pathToFolder, { recursive: true, mode: 0o777 });
  }
};

const shouldIgnorePath = (folderPath, ignoredDirectories) => ignoredDirectories.some(
  (directoryToIgnore) => folderPath.split(path.sep).some((dir) => dir === directoryToIgnore)
);

const isDirectory = (directoryPath) => fs.lstatSync(directoryPath).isDirectory();

module.exports = {
  ensureDirectoryPathExists,
  isDirectory,
  shouldIgnorePath,
};
