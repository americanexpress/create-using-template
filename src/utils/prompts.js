/*
 * Copyright 2024 American Express Travel Related Services Company, Inc.
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

// Note: this is a 'prompts' wrapper to handle abort from the user.

const promptsLib = require('prompts');

const controller = new AbortController();

const prompts = (questions, opts = {}) => promptsLib(questions, {
  ...opts,
  onCancel: () => {
    // Note: we need a signal because 'prompts' exists for us and listening to SIGINT does not work
    controller.abort('user aborted');
  },
});

const hasTheUserAborted = () => controller.signal.aborted;

module.exports = {
  prompts,
  hasTheUserAborted,
};
