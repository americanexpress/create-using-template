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
const path = require('path');
const { promises: fs } = require('fs');

const runNpmInstall = require('./run-npm-install');
const runNpmCleanInstall = require('./run-npm-ci');

const installModule = async (moduleWorkingDirectory) => {
  // if the template provided a lock file we can use the faster and deterministic clean install
  // if not we can install based on current registry entries
  let runInstall;
  try {
    await fs.stat(path.join(moduleWorkingDirectory, 'package-lock.json'));
    runInstall = runNpmCleanInstall;
  } catch (error) {
    runInstall = runNpmInstall;
  }

  return runInstall(moduleWorkingDirectory);
};

module.exports = installModule;
