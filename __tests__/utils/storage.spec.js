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

const { Store } = require('data-store');
const { getStoredValues, setStoreValues, getStoredPath } = require('../../src/utils/storage');

describe('storage', () => {
  const getMock = jest.fn();
  const setMock = jest.fn();
  beforeAll(() => {
    jest.spyOn(Store.prototype, 'get').mockImplementation(getMock);
    jest.spyOn(Store.prototype, 'set').mockImplementation(setMock);
  });
  describe('getStoredValues', () => {
    it('should retrieve stored values', () => {
      getStoredValues('test');
      expect(getMock).toHaveBeenCalled();
    });
  });
  describe('setStoreValues', () => {
    it('should save values', () => {
      setStoreValues('test', '1.0.0', 123);
      expect(setMock).toHaveBeenCalledWith(123);
    });
  });
  describe('getStoredPath', () => {
    it('should get path with major version', () => {
      expect(getStoredPath('test', '1.5.0')).toBe('.create-using-template/test/v1/stored.json');
    });
    it('should get path without version', () => {
      expect(getStoredPath('test', 'invalid')).toBe('.create-using-template/test/stored.json');
    });
  });
});
