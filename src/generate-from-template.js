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
const kleur = require('kleur');
const path = require('path');
const log = require('./utils/log');
const installTemplate = require('./utils/install-template');
const installModule = require('./utils/install-module');
const getBaseOptions = require('./utils/get-base-options');
const walkTemplate = require('./utils/walk-template');
const renameDirectories = require('./utils/renameDirectories');
const { initializeGitRepo, createInitialCommit } = require('./utils/git');
const getPackageName = require('./utils/get-package-name');
const getPackageVersion = require('./utils/get-package-version');
const { getStoredValues, setStoreValues } = require('./utils/storage');

const noop = () => 0;
const defaultLifecycleMethods = {
  preGenerate: noop,
  postGenerate: noop,
  preGitInit: noop,
  postGitInit: noop,
  preInstall: noop,
  postInstall: noop,
  preCommit: noop,
  postCommit: noop,
};

const generateFromTemplate = async ({ templateName }) => {
  // Load the template
  log.goToStep(1);
  await installTemplate(templateName);

  const templatePackageName = getPackageName(templateName);

  /* eslint-disable global-require,import/no-dynamic-require
  -- we need to dynamically require this package as its name is only known ar runtime */
  const templatePackage = require(templatePackageName);
  /* eslint-enable global-require,import/no-dynamic-require -- re-enable */
  let templateBanner;
  if (typeof templatePackage.getTemplateBanner === 'function') {
    const templateBannerResponse = templatePackage.getTemplateBanner(kleur);
    if (typeof templateBannerResponse === 'string') {
      templateBanner = templateBannerResponse;
    }
  }

  // Gather parameters
  log.goToStep(2, templateBanner);
  const templateVersion = getPackageVersion(templateName);
  const storedValues = getStoredValues(templatePackageName, templateVersion);
  const baseData = await getBaseOptions();
  const {
    templateValues,
    generatorOptions = {},
    dynamicFileNames = [],
    dynamicDirectoryNames = [],
    ignoredFileNames = [],
    ignoredDirectories = [],
    lifecycle: configuredLifecycleMethods = {},
  } = await templatePackage.getTemplateOptions(baseData, prompts, storedValues);
  const lifecycle = { ...defaultLifecycleMethods, ...configuredLifecycleMethods };
  if (generatorOptions.storeResponses) {
    setStoreValues(templatePackageName, templateVersion, templateValues);
  }
  const templateDirPaths = templatePackage.getTemplatePaths();
  // Generate Module
  log.goToStep(3, templateBanner);
  lifecycle.preGenerate();
  templateDirPaths.forEach((templateRootPath) => walkTemplate(
    templateRootPath,
    `./${templateValues.projectName}`,
    {
      ignoredFileNames,
      ignoredDirectories,
      dynamicFileNames,
      templateValues,
    }
  ));
  if (Object.keys(dynamicDirectoryNames).length > 0) {
    renameDirectories(path.resolve(`./${templateValues.projectName}`), { dynamicDirectoryNames });
  }
  lifecycle.postGenerate();

  // Initialize git before installing deps. This allows git hooks to be setup
  // as part of install
  log.goToStep(4, templateBanner);
  const skipGitInit = lifecycle.preGitInit();
  if (!skipGitInit) await initializeGitRepo(`./${templateValues.projectName}`);
  lifecycle.postGitInit();

  // Install and build the module
  log.goToStep(5, templateBanner);
  const skipInstall = lifecycle.preInstall();
  if (!skipInstall) await installModule(`./${templateValues.projectName}`);
  lifecycle.postInstall();

  // Create the first commit
  log.goToStep(6, templateBanner);
  const skipCommit = lifecycle.preCommit();
  if (!skipCommit && !skipGitInit) await createInitialCommit(`./${templateValues.projectName}`, generatorOptions);
  lifecycle.postCommit();

  if (generatorOptions.postGenerationMessage) {
    console.log(generatorOptions.postGenerationMessage);
  }
};

module.exports = generateFromTemplate;
