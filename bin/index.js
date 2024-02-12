#! /usr/bin/env node

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

const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');

const generateFromTemplate = require('../src/generate-from-template');
const createBuildLogger = require('../src/utils/create-build-logger');
const { hasTheUserAborted } = require('../src/utils/prompts');

const buildLogger = createBuildLogger();

const run = async () => {
  const { $0, _: [templateName], ...options } = yargs(hideBin(process.argv)).argv;

  await generateFromTemplate({
    templateName,
    buildLogger,
    options,
  });
};

run().catch(async (err) => {
  if (hasTheUserAborted()) {
    console.log('Template generation aborted');
  } else {
    console.error('Failed to create module:', err.message);
    console.error(err);
    await buildLogger.addError(err);
  }

  process.exit(1);
});
