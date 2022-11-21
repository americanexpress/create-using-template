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

const { promises: fs } = require('fs');
const createBuildLogger = require('../../src/utils/create-build-logger');

jest.mock('../../package.json', () => ({ version: '0.x.x' }));

jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs');
  return {
    ...actualFs,
    promises: {
      ...actualFs.promises,
      writeFile: jest.fn(),
      rename: jest.fn(),
    },
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

  beforeEach(() => {
    jest.clearAllMocks();
    buildLogger = createBuildLogger();
  });

  it('should initialize with engines and template name', async () => {
    await buildLogger.init('mock-template');
    expect(fs.writeFile).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fs.writeFile.mock.calls[0][1])).toMatchInlineSnapshot(`
      Object {
        "engines": Object {
          "create-using-template": "v0.x.x",
          "node": "v18.x.x",
          "npm": "v8.x.x",
        },
        "steps": Object {},
        "template": Object {
          "name": "mock-template",
        },
      }
    `);
  });

  it('should add template version and values to the build log', async () => {
    await buildLogger.addTemplateDetails({
      templateVersion: '0.0.0',
      templateValues: { test: 'value' },
    });
    expect(fs.writeFile).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fs.writeFile.mock.calls[0][1])).toMatchInlineSnapshot(`
      Object {
        "engines": Object {
          "create-using-template": "v0.x.x",
          "node": "v18.x.x",
          "npm": "v8.x.x",
        },
        "steps": Object {},
        "template": Object {
          "values": Object {
            "test": "value",
          },
          "version": "v0.0.0",
        },
      }
    `);
  });

  it('should add step details to the build log', async () => {
    await buildLogger.addStep(1, 'complete');
    expect(fs.writeFile).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fs.writeFile.mock.calls[0][1])).toMatchInlineSnapshot(`
      Object {
        "engines": Object {
          "create-using-template": "v0.x.x",
          "node": "v18.x.x",
          "npm": "v8.x.x",
        },
        "steps": Object {
          "1": Object {
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
    await buildLogger.addError(error);
    expect(fs.writeFile).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fs.writeFile.mock.calls[0][1])).toMatchInlineSnapshot(`
      Object {
        "engines": Object {
          "create-using-template": "v0.x.x",
          "node": "v18.x.x",
          "npm": "v8.x.x",
        },
        "error": Object {
          "message": "Error: test error",
          "stack": "mock stack",
        },
        "steps": Object {},
      }
    `);
  });

  it('should move the build log into the project', async () => {
    await buildLogger.init();
    await buildLogger.moveBuildLogToProject('my-project');
    await buildLogger.addStep(1, 'complete');
    expect(fs.rename).toHaveBeenCalledTimes(1);
    expect(fs.rename.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "./.tmp-cut-build-log-1669069580729.json",
        "my-project/.cut-build-log.json",
      ]
    `);
    expect(fs.writeFile).toHaveBeenCalledTimes(2);
    expect(fs.writeFile.mock.calls[0][0]).toMatchInlineSnapshot(
      '"./.tmp-cut-build-log-1669069580729.json"'
    );
    expect(fs.writeFile.mock.calls[1][0]).toMatchInlineSnapshot(
      '"my-project/.cut-build-log.json"'
    );
  });
});
