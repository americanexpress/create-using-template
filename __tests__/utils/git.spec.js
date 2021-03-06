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

const { initializeGitRepo, createInitialCommit } = require('../../src/utils/git');
const runCommand = require('../../src/utils/run-command');

jest.mock('../../src/utils/run-command', () => jest.fn());

describe('initializeGitRepo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  it('should initialize a git repo', async () => {
    await initializeGitRepo('repoPathMock');

    expect(runCommand.mock.calls[0]).toEqual(['git', ['init'], 'repoPathMock']);
  });
});

describe('createInitialCommit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  it('commits a message on the main branch', async () => {
    await createInitialCommit('repoPathMock', {});
    expect(runCommand.mock.calls).toMatchSnapshot();
  });

  it('commits a message and a branch from the special template values', async () => {
    await createInitialCommit('repoPathMock', {
      defaultBranchName: 'defaultBranchNameMock',
      initialCommitMessage: 'initialCommitMessageMock',
    });

    expect(runCommand.mock.calls).toMatchSnapshot();
  });

  it('includes initialCommitOptions', async () => {
    await createInitialCommit('repoPathMock', {
      defaultBranchName: 'defaultBranchNameMock',
      initialCommitOptions: ['--test-option'],
    });

    expect(runCommand.mock.calls).toMatchSnapshot();
  });
});
