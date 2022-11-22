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

jest.mock('prompts', () => jest.fn((questions) => questions.reduce((acc, curr) => {
  if (!curr.type) return acc;
  return {
    ...acc,
    [curr.name]: `${curr.name}MockPromptsValue`,
  };
}, {})));

describe('getBaseOptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should call prompts with the correct set of base options', async () => {
    const options = await getBaseOptions();
    expect(prompts).toHaveBeenCalledTimes(1);
    // snapshot params as its a large array that will grow over time.
    // test prompts validation
    expect(prompts.mock.calls[0]).toMatchSnapshot();
    expect(options).toEqual({ projectName: 'projectNameMockPromptsValue' });
  });
  it('should skip project name when provided in options', async () => {
    const options = await getBaseOptions({ projectName: 'mockProjectNameFromOptions' });
    expect(prompts).toHaveBeenCalledTimes(1);
    expect(prompts.mock.calls[0][0][0].type).toBe(null);
    expect(options).toEqual({ projectName: 'mockProjectNameFromOptions' });
  });
});
