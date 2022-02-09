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

const fs = require('fs');
const renameFolders = require('../../src/utils/renameFolders');
const {
  isDirectory,
} = require('../../src/utils/directory');

jest.mock('fs', () => ({
  readdirSync: jest.fn(),
  renameSync: jest.fn(),
}));
jest.mock('../../src/utils/directory', () => ({
  ...jest.requireActual('../../src/utils/directory'),
  isDirectory: jest.fn(() => false),
}));

describe('renameFolders', () => {
  const foldersMock = [];
  let templateOptionsMock;
  beforeEach(() => {
    jest.clearAllMocks();
    fs.readdirSync.mockImplementation(() => foldersMock);

    templateOptionsMock = {
      dynamicFolderNames: [],
    };
  });

  it('should recurse if a file in that directory is a directory', () => {
    isDirectory.mockImplementationOnce(() => true);
    fs.readdirSync.mockImplementationOnce(() => ['dirMock']).mockImplementationOnce(() => []);
    renameFolders('output/root/path/mock', templateOptionsMock);

    expect(fs.readdirSync).toHaveBeenCalledTimes(2);
  });

  it('should call the rename function if dynamicFolderNames exists', () => {
    // This test mimics this folder structure
    // folder1                -> recurse
    //    index.html          -> copyFile
    // folder2                -> recurse
    //    index.css.ejs       -> renderAndWriteTemplateFile
    //    index.js.ejs        -> renderAndWriteTemplateFile
    //    indexIgnore.js      -> ignore
    // root.html              -> copyFile
    // rootIgnore.html        -> ignore

    fs.readdirSync.mockImplementationOnce(
      () => ['folder1', 'folder2', 'root.html', 'rootIgnore.html']
    ).mockImplementationOnce(
      () => ['index.html']
    ).mockImplementationOnce(
      () => ['index.css.ejs', 'index.js.ejs', 'indexIgnore.js']
    );
    isDirectory.mockImplementationOnce(() => true) // folder 1
      .mockImplementationOnce(() => false) // index.html
      .mockImplementationOnce(() => true) // folder 2
      .mockImplementationOnce(() => false) // index.css.ejs
      .mockImplementationOnce(() => false) // index.js.ejs
      .mockImplementationOnce(() => false) // indexIgnore.js
      .mockImplementationOnce(() => false) // root.html
      .mockImplementationOnce(() => false); // rootIgnore.html

    templateOptionsMock.dynamicFolderNames = { folder1: 'folder1Renamed' };

    renameFolders('output/root/path/mock', templateOptionsMock);

    expect(fs.readdirSync).toHaveBeenCalledTimes(3);
  });
});
