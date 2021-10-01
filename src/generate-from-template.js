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
const log = require('./utils/log');
const installTemplate = require('./utils/install-template');
const installModule = require('./utils/install-module');
const getBaseOptions = require('./utils/get-base-options');
const walkTemplate = require('./utils/walk-template');
const initializeGitRepo = require('./utils/initialize-git-repo');
const getPackageName = require('./utils/get-package-name');

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
  const baseData = await getBaseOptions();
  const {
    templateValues,
    generatorOptions = {},
    dynamicFileNames = [],
    ignoredFileNames = [],
  } = await templatePackage.getTemplateOptions(baseData, prompts);
  const templateDirPaths = templatePackage.getTemplatePaths();

  // Generate Module
  log.goToStep(3, templateBanner);

  templateDirPaths.forEach((templateRootPath) => walkTemplate(
    templateRootPath,
    `./${templateValues.projectName}`,
    {
      ignoredFileNames,
      dynamicFileNames,
      templateValues,
    }
  ));

  // Install and build the module
  log.goToStep(4, templateBanner);
  await installModule(`./${templateValues.projectName}`);

  // Initialize git
  log.goToStep(5, templateBanner);
  await initializeGitRepo(`./${templateValues.projectName}`, generatorOptions);

  if (generatorOptions.postGenerationMessage) {
    console.log(generatorOptions.postGenerationMessage);
  }
};

module.exports = generateFromTemplate;
