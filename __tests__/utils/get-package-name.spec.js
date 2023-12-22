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
const getPackageName = require('../../src/utils/get-package-name');

jest.mock('fs', () => ({
  readFileSync: () => ({
    dependencies: {
      anotherDepName: '1.0.0',
      templateDepName: 'file:../some/path/my-template.tgz',
    },
  }),
}));

const jsonParse = JSON.parse;

describe('getPackageName', () => {
  beforeAll(() => {
    JSON.parse = (fakeJson) => fakeJson;
  });

  afterAll(() => {
    JSON.parse = jsonParse;
  });

  it('removes version', () => {
    expect(getPackageName('@somescope/my-template@1.3.0')).toEqual('@somescope/my-template');
  });

  it('does not remove scope', () => {
    expect(getPackageName('@somescope/my-template')).toEqual('@somescope/my-template');
  });

  it('retrieves name from installed package on relative path', () => {
    expect(getPackageName('../some/path/my-template.tgz')).toEqual('templateDepName');
  });

  it('retrieves name from installed package on absolute path', () => {
    const resolvedAbsolutePath = path.resolve(__dirname, '../..', '../some/path/my-template.tgz');
    expect(getPackageName(resolvedAbsolutePath)).toEqual('templateDepName');
  });
});
