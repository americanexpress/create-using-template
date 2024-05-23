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

const { promises: fs } = require('fs');

const runNpmInstall = require('../../src/utils/run-npm-install');
const runNpmCleanInstall = require('../../src/utils/run-npm-ci');
const installModule = require('../../src/utils/install-module');

jest.mock('../../src/utils/run-npm-install', () => jest.fn(() => Promise.resolve('npmInstallResponseMock')));
jest.mock('../../src/utils/run-npm-ci', () => jest.fn(() => Promise.resolve('npmCleanInstallResponseMock')));

describe('installModule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(fs, 'stat');
  });
  it('should runNpmInstall with the correct parameters when there is no lock file', async () => {
    expect.assertions(3);
    fs.stat.mockImplementationOnce((filePath) => Promise.reject(Object.assign(
      new Error(`ENOENT: no such file or directory, stat '${filePath}`),
      {
        errno: -2,
        syscall: 'stat',
        code: 'ENOENT',
        path: filePath,
      }
    )));
    await expect(installModule('workingDirectoryMock')).resolves.toBe('npmInstallResponseMock');
    expect(runNpmInstall).toHaveBeenCalledTimes(1);
    expect(runNpmInstall).toHaveBeenNthCalledWith(1, 'workingDirectoryMock');
  });
  it('should runNpmCleanInstall with the correct parameters when there is a lock file', async () => {
    expect.assertions(3);
    fs.stat.mockImplementationOnce(() => Promise.resolve({
      size: 1760539,
      blocks: 3440,
      // Stats instance and lots of fields, not relevant to the unit so omitted for spec brevity
    }));
    await expect(installModule('workingDirectoryMock')).resolves.toBe('npmCleanInstallResponseMock');
    expect(runNpmCleanInstall).toHaveBeenCalledTimes(1);
    expect(runNpmCleanInstall).toHaveBeenNthCalledWith(1, 'workingDirectoryMock');
  });
});
