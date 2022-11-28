/*
 * Copyright 2022 American Express Travel Related Services Company, Inc.
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
const { execSync } = require('child_process');
const path = require('path');
const pack = require('../../package.json');

const createBuildLogger = () => {
  const buildLog = {
    engines: {
      node: process.version,
      npm: `v${execSync('npm -v').toString().trim()}`,
      'create-using-template': `v${pack.version}`,
    },
    steps: {},
  };

  let buildLogPath = path.resolve(`./.tmp-cut-build-log-${Date.now()}.json`);

  const init = (templateName) => {
    buildLog.template = { name: templateName };
  };

  const addTemplateDetails = ({ templateVersion, templateValues }) => {
    buildLog.template = {
      ...buildLog.template,
      version: `v${templateVersion}`,
      values: templateValues,
    };
  };

  const moveBuildLogToProject = (projectName) => {
    buildLogPath = path.join(path.resolve(`./${projectName}`), '.cut-build-log.json');
  };

  const addStep = (number, status) => {
    buildLog.steps[number.toString()] = { status, timestamp: Date.now() };
  };

  const addError = (error) => {
    buildLog.error = {
      message: error.toString(),
      stack: error.stack,
    };
  };

  process.on('exit', () => fs.writeFileSync(buildLogPath, JSON.stringify(buildLog, null, 2)));

  return {
    addError,
    addStep,
    addTemplateDetails,
    init,
    moveBuildLogToProject,
  };
};

module.exports = createBuildLogger;
