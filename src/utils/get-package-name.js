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

// This only works if tarball has been installed
const getPackageName = (templateName) => {
  if (templateName.match(/^\..+\.(tgz|tar(\.gz){0,1})$/)) {
    const { dependencies } = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../package.json')));
    return Object.entries(dependencies)
      .find(([, version]) => version.match(templateName))[0];
  }
  return templateName.charAt(0) + templateName.slice(1).split('@')[0];
};

module.exports = getPackageName;
