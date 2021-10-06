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

const os = require('os');
const path = require('path');
const { Store } = require('data-store');
const semverMajor = require('semver/functions/major');
const semverValid = require('semver/functions/valid');

const getStoredPath = (templateName, templateVersion) => (semverValid(templateVersion)
  ? `.create-using-template/${templateName}/v${semverMajor(templateVersion)}/stored.json`
  : `.create-using-template/${templateName}/stored.json`);

const getStoredValues = (templateName, templateVersion) => {
  const store = new Store({
    path: path.join(os.homedir(), getStoredPath(templateName, templateVersion)),
  });
  return store.get();
};

const setStoreValues = (templateName, templateVersion, values) => {
  const store = new Store({
    path: path.join(os.homedir(), getStoredPath(templateName, templateVersion)),
  });
  store.set(values);
};

module.exports = {
  getStoredValues,
  setStoreValues,
  getStoredPath,
};
