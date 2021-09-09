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

const initializeGitRepo = async (repoPath, templateValues) => {
  console.log('Initialize git repo');
  await runCommand('git', ['init'], repoPath);

  console.log('Add all files');
  await runCommand('git', ['add', '.'], repoPath);

  // eslint-disable-next-line no-underscore-dangle
  const commitMessage = templateValues._initialCommitMessage || 'feat(generation): initial commit';
  console.log(`Create initial commit with message: ${commitMessage}`);
  await runCommand('git', ['commit', `-m${commitMessage}`, '--quiet'], repoPath);

  // eslint-disable-next-line no-underscore-dangle
  const branchName = templateValues._defaultBranchName || 'main';
  console.log(`Rename branch to ${branchName}`);
  await runCommand('git', ['branch', '-m', branchName], repoPath);
};

module.exports = initializeGitRepo;
