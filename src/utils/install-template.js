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
const fs = require('fs');
const runNpmInstall = require('./run-npm-install');

const resolveRelativeTarball = (templateName) => {
  // matches if a relative path to tarball
  if (templateName.match(/^\..+\.(tgz|tar(\.gz){0,1})$/)) {
    const templatePath = path.resolve(templateName);
    return fs.existsSync(templatePath) ? templatePath : templateName;
  }
  return templateName;
};

const installTemplate = (templateName) => runNpmInstall(__dirname, [
  resolveRelativeTarball(templateName),
  '--ignore-scripts',
  '--save',
  '--save-exact',
]);

module.exports = installTemplate;
