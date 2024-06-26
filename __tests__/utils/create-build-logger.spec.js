/*
 * Copyright 2022 American Express Travel Related Services Company, Inc.
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

const fs = require('fs');
const createBuildLogger = require('../../src/utils/create-build-logger');

jest.mock('../../package.json', () => ({ version: '0.x.x' }));

jest.spyOn(process, 'on').mockImplementation(() => {});

jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs');
  return {
    ...actualFs,
    writeFileSync: jest.fn(),
  };
});

jest.mock('path', () => {
  const actualPath = jest.requireActual('path');
  return {
    ...actualPath,
    resolve: (x) => x,
  };
});

jest.mock('child_process', () => ({
  execSync: () => Buffer.from('8.x.x\n'),
}));

jest.spyOn(Date, 'now');
Object.defineProperty(process, 'version', { value: 'v18.x.x' });

describe('create-build-logger', () => {
  Date.now.mockReturnValue(1669069580729);
  let buildLogger;
  let writeLog;

  beforeEach(() => {
    jest.clearAllMocks();
    buildLogger = createBuildLogger();
    [[, writeLog]] = process.on.mock.calls;
  });

  it('should initialize with engines and template name', async () => {
    buildLogger.init('mock-template');
    await writeLog();
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fs.writeFileSync.mock.calls[0][1])).toMatchInlineSnapshot(`
{
  "engines": {
    "create-using-template": "v0.x.x",
    "node": "v18.x.x",
    "npm": "v8.x.x",
  },
  "steps": {},
  "template": {
    "name": "mock-template",
  },
}
`);
  });

  it('should add template version and values to the build log', async () => {
    buildLogger.addTemplateDetails({
      templateVersion: '0.0.0',
      templateValues: { test: 'value' },
    });
    await writeLog();
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fs.writeFileSync.mock.calls[0][1])).toMatchInlineSnapshot(`
{
  "engines": {
    "create-using-template": "v0.x.x",
    "node": "v18.x.x",
    "npm": "v8.x.x",
  },
  "steps": {},
  "template": {
    "values": {
      "test": "value",
    },
    "version": "v0.0.0",
  },
}
`);
  });

  it('should add step details to the build log', async () => {
    buildLogger.addStep(1, 'complete');
    await writeLog();
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fs.writeFileSync.mock.calls[0][1])).toMatchInlineSnapshot(`
{
  "engines": {
    "create-using-template": "v0.x.x",
    "node": "v18.x.x",
    "npm": "v8.x.x",
  },
  "steps": {
    "1": {
      "status": "complete",
      "timestamp": 1669069580729,
    },
  },
}
`);
  });

  it('should add error details to the build log', async () => {
    const error = new Error('test error');
    error.stack = 'mock stack';
    buildLogger.addError(error);
    await writeLog();
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fs.writeFileSync.mock.calls[0][1])).toMatchInlineSnapshot(`
{
  "engines": {
    "create-using-template": "v0.x.x",
    "node": "v18.x.x",
    "npm": "v8.x.x",
  },
  "error": {
    "message": "Error: test error",
    "stack": "mock stack",
  },
  "steps": {},
}
`);
  });

  it('should move the build log into the project', async () => {
    await buildLogger.init();
    await writeLog();
    await buildLogger.moveBuildLogToProject('my-project');
    await writeLog();
    expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
    expect(fs.writeFileSync.mock.calls[0][0]).toMatchInlineSnapshot(
      '"./.tmp-cut-build-log-1669069580729.json"'
    );
    expect(fs.writeFileSync.mock.calls[1][0]).toMatchInlineSnapshot(
      '"my-project/.cut-build-log.json"'
    );
  });
});
