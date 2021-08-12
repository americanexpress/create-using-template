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

const path = require('path');
const fs = require('fs');
const runNpmInstall = require('../../src/utils/run-npm-install');
const installTemplate = require('../../src/utils/install-template');

jest.mock('../../src/utils/run-npm-install', () => jest.fn(() => 'npmInstallResponseMock'));
jest.mock('fs');

describe('installTemplate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should runNpmInstall with the correct parameters', () => {
    expect(installTemplate('templateNameMock')).toBe('npmInstallResponseMock');
    expect(runNpmInstall).toHaveBeenCalledTimes(1);
    expect(runNpmInstall).toHaveBeenNthCalledWith(1, path.resolve(`${__dirname}/../../src/utils/`), ['templateNameMock', '--ignore-scripts', '--save', '--save-exact']);
  });

  describe('when provided local tarball', () => {
    it('uses resolved path when exists', () => {
      fs.existsSync.mockReturnValueOnce(true);
      expect(installTemplate('./templateName.tgz')).toBe('npmInstallResponseMock');
      expect(runNpmInstall).toHaveBeenCalledTimes(1);
      expect(runNpmInstall).toHaveBeenCalledWith(path.resolve(`${__dirname}/../../src/utils/`), [path.resolve('./templateName.tgz'), '--ignore-scripts', '--save', '--save-exact']);
    });

    it('uses given name when does not exists', () => {
      fs.existsSync.mockReturnValueOnce(false);
      expect(installTemplate('./templateName.tgz')).toBe('npmInstallResponseMock');
      expect(runNpmInstall).toHaveBeenCalledTimes(1);
      expect(runNpmInstall).toHaveBeenNthCalledWith(1, path.resolve(`${__dirname}/../../src/utils/`), ['./templateName.tgz', '--ignore-scripts', '--save', '--save-exact']);
    });
  });
});
