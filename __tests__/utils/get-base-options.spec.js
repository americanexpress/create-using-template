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
const getBaseOptions = require('../../src/utils/get-base-options');

jest.mock('prompts', () => jest.fn(() => 'promptsResponseMock'));

describe('getBaseOptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should call prompts with the correct set of base options', () => {
    getBaseOptions();
    expect(prompts).toHaveBeenCalledTimes(1);
    // snapshot params as its a large array that will grow over time.
    // test prompts validation
    expect(prompts.mock.calls[0][0][0].validate('testProjectName')).toBe(true);
    expect(prompts.mock.calls[0]).toMatchSnapshot();
  });
  it('should call prompts with the correct set of options when regex is passed', () => {
    const testRegex = /[^a-z-]+/gi;
    getBaseOptions(testRegex);
    expect(prompts).toHaveBeenCalledTimes(1);
    // snapshot params as its a large array that will grow over time.
    // test prompts validation
    expect(prompts.mock.calls[0][0][0].validate('test Project Name')).toBe('Invalid project name format, please make corrections.');
    expect(prompts.mock.calls[0][0][0].format('test Project Name')).toBe("testProjectName");
    expect(prompts.mock.calls[0]).toMatchSnapshot();
  });
});
