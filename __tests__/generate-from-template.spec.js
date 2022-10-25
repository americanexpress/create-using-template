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

const { getTemplateOptions, lifecycleMocks } = require('ejs'); // see the comment above the ejs mock as to why 'ejs' is our 'template' for this tests
const { Store } = require('data-store');
const path = require('path');
const log = require('../src/utils/log');
const installTemplate = require('../src/utils/install-template');
const installModule = require('../src/utils/install-module');
const getBaseOptions = require('../src/utils/get-base-options');
const walkTemplate = require('../src/utils/walk-template');
const { initializeGitRepo, createInitialCommit } = require('../src/utils/git');

const generateFromTemplate = require('../src/generate-from-template');
const renameDirectories = require('../src/utils/renameDirectories');

jest.mock('prompts', () => 'promptsMock');
jest.mock('../src/utils/log', () => ({
  goToStep: jest.fn(),
}));
jest.mock('../src/utils/install-template', () => jest.fn());
jest.mock('../src/utils/install-module', () => jest.fn());
jest.mock('../src/utils/get-base-options', () => jest.fn(() => 'baseOptionsMock'));
jest.mock('../src/utils/walk-template', () => jest.fn());
jest.mock('../src/utils/renameDirectories', () => jest.fn());
jest.mock('../src/utils/git', () => ({
  initializeGitRepo: jest.fn(),
  createInitialCommit: jest.fn(),
}));

// We need to require a package that is not installed, as its provided at runtime
// There is no way to jest mock a package that is not installed.
// So the jest hack work around to this is to use a package that is installed, but is never imported
// We can mock that package, then use that as our 'template' for the rest of the tests.
// ejs will do, as it is not imported from generate-from-template
jest.mock('ejs', () => {
  const lifecycleMockFns = {
    preGenerate: jest.fn(),
    postGenerate: jest.fn(),
    preGitInit: jest.fn(),
    postGitInit: jest.fn(),
    preInstall: jest.fn(),
    postInstall: jest.fn(),
    preCommit: jest.fn(),
    postCommit: jest.fn(),
  };

  return {
    getTemplateOptions: jest.fn(() => ({
      templateValues: { projectName: 'projectNameMock' },
      dynamicFileNames: 'dynamicFileNamesMock',
      ignoredFileNames: 'ignoredFileNamesMock',
      dynamicDirectoryNames: { dynamicDirectoryName: 'dynamicDirectoryNameRename' },
      ignoredDirectories: [],
      lifecycle: lifecycleMockFns,
    })),
    getTemplatePaths: jest.fn(() => ['path1Mock', 'path2Mock']),
    lifecycleMocks: lifecycleMockFns,
  };
});

describe('generateFromTemplate', () => {
  let templatePackage;
  const getMock = jest.fn();
  const setMock = jest.fn();
  beforeEach(() => {
    // eslint-disable-next-line global-require -- we need access to a fresh import for every test
    templatePackage = require('ejs');
    templatePackage.templateFlags = { noBaseData: false };
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => { });
    jest.spyOn(console, 'warn').mockImplementation(() => { });
    jest.spyOn(Store.prototype, 'get').mockImplementation(getMock);
    jest.spyOn(Store.prototype, 'set').mockImplementation(setMock);
  });
  it('should call the generatorBanner, and all 6 steps', async () => {
    await generateFromTemplate({ templateName: 'ejs@1.0.0' });

    expect(log.goToStep).toHaveBeenCalledTimes(6);
    expect(log.goToStep).toHaveBeenNthCalledWith(1, 1);
    expect(log.goToStep).toHaveBeenNthCalledWith(2, 2, undefined);
    expect(log.goToStep).toHaveBeenNthCalledWith(3, 3, undefined);
    expect(log.goToStep).toHaveBeenNthCalledWith(4, 4, undefined);
    expect(log.goToStep).toHaveBeenNthCalledWith(5, 5, undefined);
    expect(log.goToStep).toHaveBeenNthCalledWith(6, 6, undefined);
  });

  it('should call the generatorBanner, and all 6 steps if the template provides a banner', async () => {
    templatePackage.getTemplateBanner = jest.fn(() => 'TemplateBannerMock');
    await generateFromTemplate({ templateName: 'ejs@1.0.0' });

    expect(log.goToStep).toHaveBeenCalledTimes(6);
    expect(log.goToStep).toHaveBeenNthCalledWith(1, 1);
    expect(log.goToStep).toHaveBeenNthCalledWith(2, 2, 'TemplateBannerMock');
    expect(log.goToStep).toHaveBeenNthCalledWith(3, 3, 'TemplateBannerMock');
    expect(log.goToStep).toHaveBeenNthCalledWith(4, 4, 'TemplateBannerMock');
    expect(log.goToStep).toHaveBeenNthCalledWith(5, 5, 'TemplateBannerMock');
    expect(log.goToStep).toHaveBeenNthCalledWith(6, 6, 'TemplateBannerMock');
  });

  it('should call the generatorBanner, and all 6 steps if the template provides a banner that is mallformed', async () => {
    // the banner is a function instead of a string
    templatePackage.getTemplateBanner = jest.fn(() => () => { });
    await generateFromTemplate({ templateName: 'ejs@1.0.0' });

    expect(log.goToStep).toHaveBeenCalledTimes(6);
    expect(log.goToStep).toHaveBeenNthCalledWith(1, 1);
    expect(log.goToStep).toHaveBeenNthCalledWith(2, 2, undefined);
    expect(log.goToStep).toHaveBeenNthCalledWith(3, 3, undefined);
    expect(log.goToStep).toHaveBeenNthCalledWith(4, 4, undefined);
    expect(log.goToStep).toHaveBeenNthCalledWith(5, 5, undefined);
    expect(log.goToStep).toHaveBeenNthCalledWith(6, 6, undefined);
  });

  // Step 1
  it('should install the template passed', async () => {
    await generateFromTemplate({ templateName: 'ejs@1.0.0' });

    expect(installTemplate).toHaveBeenCalledTimes(1);
    expect(installTemplate).toHaveBeenNthCalledWith(1, 'ejs@1.0.0');
  });

  // Step 2
  it('should get the base options, template options, and template paths', async () => {
    await generateFromTemplate({ templateName: 'ejs@1.0.0' });

    expect(getBaseOptions).toHaveBeenCalledTimes(1);
    expect(getBaseOptions).toHaveBeenNthCalledWith(1);

    expect(templatePackage.getTemplateOptions).toHaveBeenCalledTimes(1);
    expect(templatePackage.getTemplateOptions).toHaveBeenNthCalledWith(1, 'baseOptionsMock', 'promptsMock', undefined);

    expect(templatePackage.getTemplatePaths).toHaveBeenCalledTimes(1);
    expect(templatePackage.getTemplatePaths).toHaveBeenNthCalledWith(1);
  });

  it('should take defaults for the non-required keys in getTemplateOptions', async () => {
    templatePackage.getTemplateOptions.mockImplementationOnce(() => ({ templateValues: { projectName: 'projectNameMock' } }));
    await generateFromTemplate({ templateName: 'ejs@1.0.0' });

    expect(getBaseOptions).toHaveBeenCalledTimes(1);
    expect(getBaseOptions).toHaveBeenNthCalledWith(1);

    expect(templatePackage.getTemplateOptions).toHaveBeenCalledTimes(1);
    expect(templatePackage.getTemplateOptions).toHaveBeenNthCalledWith(1, 'baseOptionsMock', 'promptsMock', undefined);

    expect(templatePackage.getTemplatePaths).toHaveBeenCalledTimes(1);
    expect(templatePackage.getTemplatePaths).toHaveBeenNthCalledWith(1);
  });
  it('should call getTemplateOptions without baseOptions parameter if supplied with noBaseData template flag', async () => {
    templatePackage.getTemplateOptions.mockImplementationOnce(() => ({ templateValues: { projectName: 'projectNameMock' } }));
    templatePackage.templateFlags = { noBaseData: true };
    await generateFromTemplate({ templateName: 'ejs@1.0.0' });

    expect(templatePackage.getTemplateOptions).toHaveBeenNthCalledWith(1, 'promptsMock', undefined);

    expect(templatePackage.getTemplatePaths).toHaveBeenCalledTimes(1);
    expect(templatePackage.getTemplatePaths).toHaveBeenNthCalledWith(1);
  });
  it('should skip baseOptions if supplied with noBaseData template flag', async () => {
    templatePackage.templateFlags = { noBaseData: true };
    await generateFromTemplate({ templateName: 'ejs@1.0.0' });
    expect(getBaseOptions).toHaveBeenCalledTimes(0);
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  // Step 3
  it('should call walk template for each path', async () => {
    await generateFromTemplate({ templateName: 'ejs@1.0.0' });

    expect(lifecycleMocks.preGenerate).toHaveBeenCalledTimes(1);
    expect(walkTemplate).toHaveBeenCalledTimes(2);
    expect(walkTemplate).toHaveBeenNthCalledWith(1, 'path1Mock', './projectNameMock', {
      templateValues: { projectName: 'projectNameMock' },
      dynamicFileNames: 'dynamicFileNamesMock',
      ignoredFileNames: 'ignoredFileNamesMock',
      ignoredDirectories: [],
    });
    expect(walkTemplate).toHaveBeenNthCalledWith(2, 'path2Mock', './projectNameMock', {
      templateValues: { projectName: 'projectNameMock' },
      dynamicFileNames: 'dynamicFileNamesMock',
      ignoredFileNames: 'ignoredFileNamesMock',
      ignoredDirectories: [],
    });
    expect(renameDirectories).toHaveBeenNthCalledWith(1, path.resolve('./projectNameMock'), {
      dynamicDirectoryNames: { dynamicDirectoryName: 'dynamicDirectoryNameRename' },
    });
    expect(lifecycleMocks.postGenerate).toHaveBeenCalledTimes(1);
  });

  it('should ignore attempts to skip generation & log a warning', async () => {
    lifecycleMocks.preGenerate.mockReturnValueOnce(Promise.resolve({ skip: true }));

    await generateFromTemplate({ templateName: 'ejs@1.0.0' });

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith('Cannot skip generation. Ignoring.');
    expect(lifecycleMocks.preGenerate).toHaveBeenCalledTimes(1);
    expect(walkTemplate).toHaveBeenCalledTimes(2);
    expect(lifecycleMocks.postGenerate).toHaveBeenCalledTimes(1);
  });

  // Step 4
  it('should initialize the git repo', async () => {
    await generateFromTemplate({ templateName: 'ejs@1.0.0' });

    expect(lifecycleMocks.preGitInit).toHaveBeenCalledTimes(1);
    expect(initializeGitRepo).toHaveBeenCalledTimes(1);
    expect(initializeGitRepo).toHaveBeenNthCalledWith(1, './projectNameMock');
    expect(lifecycleMocks.postGitInit).toHaveBeenCalledTimes(1);
  });

  it('should not initialize the git repo if the lifecycle method indicates so', async () => {
    lifecycleMocks.preGitInit.mockReturnValueOnce(Promise.resolve({ skip: true }));

    await generateFromTemplate({ templateName: 'ejs@1.0.0' });

    expect(lifecycleMocks.preGitInit).toHaveBeenCalledTimes(1);
    expect(initializeGitRepo).not.toHaveBeenCalled();
    expect(lifecycleMocks.postGitInit).not.toHaveBeenCalled();
  });

  // Step 5
  it('should install the module', async () => {
    await generateFromTemplate({ templateName: 'ejs@1.0.0' });

    expect(lifecycleMocks.preInstall).toHaveBeenCalledTimes(1);
    expect(installModule).toHaveBeenCalledTimes(1);
    expect(installModule).toHaveBeenNthCalledWith(1, './projectNameMock');
    expect(lifecycleMocks.postInstall).toHaveBeenCalledTimes(1);
  });

  it('should not install the module if the lifecycle method indicates so', async () => {
    lifecycleMocks.preInstall.mockReturnValueOnce(Promise.resolve({ skip: true }));

    await generateFromTemplate({ templateName: 'ejs@1.0.0' });

    expect(lifecycleMocks.preInstall).toHaveBeenCalledTimes(1);
    expect(installModule).not.toHaveBeenCalled();
    expect(lifecycleMocks.postInstall).not.toHaveBeenCalled();
  });

  // Step 6
  it('creates initial commit', async () => {
    await generateFromTemplate({ templateName: 'ejs@1.0.0' });

    expect(lifecycleMocks.preCommit).toHaveBeenCalledTimes(1);
    expect(createInitialCommit).toHaveBeenCalledTimes(1);
    expect(createInitialCommit).toHaveBeenNthCalledWith(1, './projectNameMock', {});
    expect(lifecycleMocks.postCommit).toHaveBeenCalledTimes(1);
  });

  it('does not create initial commit if the lifecycle method indicates so', async () => {
    lifecycleMocks.preCommit.mockReturnValueOnce(Promise.resolve({ skip: true }));

    await generateFromTemplate({ templateName: 'ejs@1.0.0' });

    expect(lifecycleMocks.preCommit).toHaveBeenCalledTimes(1);
    expect(createInitialCommit).not.toHaveBeenCalled();
    expect(lifecycleMocks.postCommit).not.toHaveBeenCalled();
  });

  it('does not create initial commit if git init was skipped', async () => {
    lifecycleMocks.preGitInit.mockReturnValueOnce(Promise.resolve({ skip: true }));

    await generateFromTemplate({ templateName: 'ejs@1.0.0' });

    expect(lifecycleMocks.preCommit).not.toHaveBeenCalled();
    expect(createInitialCommit).not.toHaveBeenCalled();
    expect(lifecycleMocks.postCommit).not.toHaveBeenCalled();
  });

  it('should print the post generation message if it exists', async () => {
    getTemplateOptions.mockImplementationOnce(() => ({
      templateValues: { projectName: 'projectNameMock' },
      generatorOptions: { postGenerationMessage: 'postGenerationMessageMock' },
      dynamicFileNames: 'dynamicFileNamesMock',
      ignoredFileNames: 'ignoredFileNamesMock',
    }));
    await generateFromTemplate({ templateName: 'ejs@1.0.0' });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenNthCalledWith(1, 'postGenerationMessageMock');
  });

  it('should store responses if generatorOptions.storeResponses is true', async () => {
    getTemplateOptions.mockImplementationOnce(() => ({
      templateValues: { projectName: 'projectNameMock' },
      generatorOptions: { storeResponses: true },
      dynamicFileNames: 'dynamicFileNamesMock',
      ignoredFileNames: 'ignoredFileNamesMock',
    }));
    await generateFromTemplate({ templateName: 'ejs@1.0.0' });
    expect(setMock).toHaveBeenCalled();
  });
  it('should NOT store responses if generatorOptions.storeResponses is false', async () => {
    getTemplateOptions.mockImplementationOnce(() => ({
      templateValues: { projectName: 'projectNameMock' },
      generatorOptions: { storeResponses: false },
      dynamicFileNames: 'dynamicFileNamesMock',
      ignoredFileNames: 'ignoredFileNamesMock',
    }));
    await generateFromTemplate({ templateName: 'ejs@1.0.0' });
    expect(setMock).not.toHaveBeenCalled();
  });
});
