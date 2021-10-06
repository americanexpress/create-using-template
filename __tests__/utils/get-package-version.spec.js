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

const getPackageVersion = require('../../src/utils/get-package-version');

jest.mock('fs', () => ({
  readFileSync: () => ({
    version: '1.3.0',
    dependencies: {
      '@somescope/my-template': '1.3.0',
    },
  }),
}));

const jsonParse = JSON.parse;

describe('getPackageVersion', () => {
  beforeAll(() => {
    JSON.parse = (fakeJson) => fakeJson;
  });

  afterAll(() => {
    JSON.parse = jsonParse;
  });

  it('gets version', () => {
    expect(getPackageVersion('@somescope/my-template')).toEqual('1.3.0');
  });
  it('should return null', () => {
    expect(getPackageVersion('not-existant-package')).toBeFalsy();
  });
});
