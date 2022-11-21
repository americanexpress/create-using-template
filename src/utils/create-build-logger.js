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

const { promises: fs } = require('fs');
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
  const writeBuildLog = async () => fs.writeFile(buildLogPath, JSON.stringify(buildLog, null, 2));

  const init = async (templateName) => {
    buildLog.template = { name: templateName };
    return writeBuildLog();
  };

  const addTemplateDetails = async ({ templateVersion, templateValues }) => {
    buildLog.template = { ...buildLog.template, version: `v${templateVersion}`, values: templateValues };
    return writeBuildLog();
  };

  const moveBuildLogToProject = async (projectName) => {
    const oldPath = buildLogPath;
    buildLogPath = path.join(path.resolve(`./${projectName}`), '.cut-build-log.json');
    return fs.rename(oldPath, buildLogPath);
  };

  const addStep = async (number, status) => {
    buildLog.steps[number.toString()] = { status, timestamp: Date.now() };
    return writeBuildLog();
  };

  const addError = async (error) => {
    buildLog.error = {
      message: error.toString(),
      stack: error.stack,
    };
    return writeBuildLog();
  };

  return {
    addError,
    addStep,
    addTemplateDetails,
    init,
    moveBuildLogToProject,
  };
};

module.exports = createBuildLogger;
