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

const { prompts } = require('./prompts');

const getBaseOptions = async (options = {}) => {
  const baseOptions = await prompts([
    {
      type: options.projectName ? null : 'text',
      name: 'projectName',
      message: 'Enter your project\'s name. This will also be used as the directory name for the project:',
      initial: '',
      validate: (value) => (value || '').length > 0 || 'Please enter your project\'s name',
    },
  ]);

  return {
    projectName: options.projectName,
    ...baseOptions,
  };
};

module.exports = getBaseOptions;
