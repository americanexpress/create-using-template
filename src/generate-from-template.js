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

const kleur = require('kleur');
const path = require('path');
const log = require('./utils/log');
const installTemplate = require('./utils/install-template');
const installModule = require('./utils/install-module');
const walkTemplate = require('./utils/walk-template');
const renameDirectories = require('./utils/renameDirectories');
const { initializeGitRepo, createInitialCommit } = require('./utils/git');
const getPackageName = require('./utils/get-package-name');
const getPackageVersion = require('./utils/get-package-version');
const { getStoredValues, setStoreValues } = require('./utils/storage');
const getTemplateOptionsWithFlags = require('./utils/getTemplateOptionsCaller');

const noop = () => ({});
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

const generateFromTemplate = async ({ templateName, buildLogger, options = {} }) => {
  buildLogger.init(templateName);
  // Load the template
  log.goToStep(1);
  buildLogger.addStep(1, 'started');
  await installTemplate(templateName);

  const templatePackageName = getPackageName(templateName);

  /* eslint-disable global-require,import/no-dynamic-require
  -- we need to dynamically require this package as its name is only known at runtime */
  const templatePackage = require(templatePackageName);
  /* eslint-enable global-require,import/no-dynamic-require -- re-enable */
  let templateBanner;
  if (typeof templatePackage.getTemplateBanner === 'function') {
    const templateBannerResponse = templatePackage.getTemplateBanner(kleur);
    if (typeof templateBannerResponse === 'string') {
      templateBanner = templateBannerResponse;
    }
  }
  buildLogger.addStep(1, 'complete');

  // Gather parameters
  log.goToStep(2, templateBanner);
  buildLogger.addStep(2, 'started');
  const templateVersion = getPackageVersion(templateName);
  const storedValues = getStoredValues(templatePackageName, templateVersion);

  const {
    templateValues,
    generatorOptions = {},
    dynamicFileNames = [],
    dynamicDirectoryNames = [],
    ignoredFileNames = [],
    ignoredDirectories = [],
    lifecycle: configuredLifecycleMethods = {},
  } = await getTemplateOptionsWithFlags({
    getTemplateOptions: templatePackage.getTemplateOptions,
    flags: templatePackage.templateFlags,
    storedValues,
    options,
  });

  buildLogger.addTemplateDetails({ templateVersion, templateValues });

  const lifecycle = { ...defaultLifecycleMethods, ...configuredLifecycleMethods };
  if (generatorOptions.storeResponses) {
    setStoreValues(templatePackageName, templateVersion, templateValues);
  }
  const templateDirPaths = templatePackage.getTemplatePaths();
  buildLogger.addStep(2, 'complete');

  // Generate Module
  log.goToStep(3, templateBanner);
  buildLogger.addStep(3, 'started');
  const { skip: skipGenerate } = { ...await lifecycle.preGenerate() };
  if (skipGenerate) console.warn('Cannot skip generation. Ignoring.');
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
  await lifecycle.postGenerate();
  buildLogger.moveBuildLogToProject(templateValues.projectName);
  buildLogger.addStep(3, 'complete');

  // Initialize git before installing deps. This allows git hooks to be setup
  // as part of install
  log.goToStep(4, templateBanner);
  buildLogger.addStep(4, 'started');
  const { skip: skipGitInit } = { ...await lifecycle.preGitInit() };
  if (!skipGitInit) {
    await initializeGitRepo(`./${templateValues.projectName}`);
    await lifecycle.postGitInit();
    buildLogger.addStep(4, 'complete');
  } else {
    buildLogger.addStep(4, 'skipped');
  }

  // Install and build the module
  log.goToStep(5, templateBanner);
  buildLogger.addStep(5, 'started');
  const { skip: skipInstall } = { ...await lifecycle.preInstall() };
  if (!skipInstall) {
    await installModule(`./${templateValues.projectName}`);
    await lifecycle.postInstall();
    buildLogger.addStep(5, 'complete');
  } else {
    buildLogger.addStep(5, 'skipped');
  }

  // Create the first commit
  if (!skipGitInit) {
    buildLogger.addStep(6, 'started');
    log.goToStep(6, templateBanner);
    const { skip: skipCommit } = { ...await lifecycle.preCommit() };
    if (!skipCommit) {
      await createInitialCommit(`./${templateValues.projectName}`, generatorOptions);
      await lifecycle.postCommit();
      buildLogger.addStep(6, 'complete');
    } else {
      buildLogger.addStep(6, 'skipped');
    }
  } else {
    buildLogger.addStep(6, 'skipped');
  }

  if (generatorOptions.postGenerationMessage) {
    console.log(generatorOptions.postGenerationMessage);
  }
};

module.exports = generateFromTemplate;
