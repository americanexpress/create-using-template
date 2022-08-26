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

const prompts = require('prompts');

const expression = /[^A-Z_a-z-]/g;

const getBaseOptions = () => prompts([
  {
    type: 'text',
    name: 'projectName',
    message: 'Enter your project\'s name. This will also be used as the directory name for the project:',
    initial: '',
    validate: (projectName) => (expression.test(projectName) ? 'Please enter a project name without spaces or special characters excluding hiphen and underscore' : true),
  },
]);

module.exports = getBaseOptions;
