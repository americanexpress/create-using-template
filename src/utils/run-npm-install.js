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

const runCommand = require('./run-command');

const runNpmInstall = async (workingDirectory, additionalArgs = []) => {
  const command = 'npm';
  const args = [
    'install',
    '--no-audit',
    '--loglevel',
    'error',
    '--no-fund',
    ...additionalArgs,
  ];

  await runCommand(command, args, workingDirectory);
};

module.exports = runNpmInstall;
