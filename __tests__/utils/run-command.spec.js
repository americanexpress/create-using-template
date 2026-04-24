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

const spawn = require('cross-spawn');
const runCommand = require('../../src/utils/run-command');

jest.mock('cross-spawn', () => jest.fn(() => ({
  on: jest.fn(),
  kill: jest.fn(),
})));

describe('runCommand', () => {
  let subProcessMock;
  let processOnSpy;
  let processRemoveListenerSpy;
  beforeEach(() => {
    jest.clearAllMocks();
    subProcessMock = {
      on: jest.fn(),
      kill: jest.fn(),
    };
    spawn.mockImplementation(() => subProcessMock);
    processOnSpy = jest.spyOn(process, 'on');
    processRemoveListenerSpy = jest.spyOn(process, 'removeListener');
  });

  afterEach(() => {
    processOnSpy.mockRestore();
    processRemoveListenerSpy.mockRestore();
  });
  it('should spawn a subProcess with the proper parameters', async () => {
    const promise = runCommand('commandMock', ['arg1', 'arg2'], 'workingDirectoryMock');
    // resolve the promise by calling the registered on close function;
    subProcessMock.on.mock.calls[0][1](0);
    await promise;

    expect(spawn).toHaveBeenCalledTimes(1);
    expect(spawn).toHaveBeenNthCalledWith(
      1,
      'commandMock',
      [
        'arg1',
        'arg2',
      ],
      {
        cwd: 'workingDirectoryMock',
        stdio: 'inherit',
      });
  });
  it('should spawn a subProcess with the proper parameters with defaults', async () => {
    const promise = runCommand('commandMock');
    // resolve the promise by calling the registered on close function;
    subProcessMock.on.mock.calls[0][1](0);
    await promise;

    expect(spawn).toHaveBeenCalledTimes(1);
    expect(spawn).toHaveBeenNthCalledWith(
      1,
      'commandMock',
      [],
      {
        cwd: './',
        stdio: 'inherit',
      });
  });
  it('should register an on close handler to the sub process', async () => {
    const promise = runCommand('commandMock', ['arg1', 'arg2'], 'workingDirectoryMock');
    // resolve the promise by calling the registered on close function;
    subProcessMock.on.mock.calls[0][1](0);
    await promise;

    expect(subProcessMock.on).toHaveBeenCalledTimes(2);
    // expecting a function to have been called with something,
    // and looking that thing up in that functions mocked parameters is not really testing anything
    // in this test we are testing that the first parameter is correct,
    // the passed function is tested in another test
    expect(subProcessMock.on).toHaveBeenNthCalledWith(1, 'close', subProcessMock.on.mock.calls[0][1]);
    expect(subProcessMock.on).toHaveBeenNthCalledWith(2, 'error', subProcessMock.on.mock.calls[1][1]);
  });

  it('should register a SIGINT listener that forwards to the sub process', async () => {
    const promise = runCommand('commandMock', ['arg1', 'arg2'], 'workingDirectoryMock');

    expect(processOnSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));

    const sigintHandler = processOnSpy.mock.calls.find(([event]) => event === 'SIGINT')[1];
    sigintHandler();

    expect(subProcessMock.kill).toHaveBeenCalledTimes(1);
    expect(subProcessMock.kill).toHaveBeenCalledWith('SIGINT');

    subProcessMock.on.mock.calls[0][1](0);
    await promise;
  });

  it('should remove the SIGINT listener when the sub process closes', async () => {
    const promise = runCommand('commandMock', ['arg1', 'arg2'], 'workingDirectoryMock');
    const sigintHandler = processOnSpy.mock.calls.find(([event]) => event === 'SIGINT')[1];

    subProcessMock.on.mock.calls[0][1](0);
    await promise;

    expect(processRemoveListenerSpy).toHaveBeenCalledWith('SIGINT', sigintHandler);
  });
  describe('the registered on close handler', () => {
    let promise;
    let isResolved;
    let isRejected;
    beforeEach(() => {
      promise = runCommand('commandMock', ['arg1', 'arg2'], 'workingDirectoryMock');
      isResolved = false;
      isRejected = false;
      promise
        .then(() => { isResolved = true; })
        .catch(() => {});
    });
    it('should do nothing and resolve the promise if passed 0', async () => {
      subProcessMock.on.mock.calls[0][1](0);
      await promise;
      expect(isResolved).toBe(true);
      expect(isRejected).toBe(false);
    });
    it('should reject the promise if passed not 0', async () => {
      subProcessMock.on.mock.calls[0][1](1);
      await expect(promise).rejects.toThrow('Failed to execute: commandMock arg1 arg2');
    });
  });

  describe('the registered on error handler', () => {
    it('should reject the promise with the subprocess error', async () => {
      const promise = runCommand('commandMock', ['arg1', 'arg2'], 'workingDirectoryMock');
      const processError = new Error('failed to start process');

      subProcessMock.on.mock.calls[1][1](processError);

      await expect(promise).rejects.toThrow('failed to start process');
    });
  });
});
