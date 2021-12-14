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

const ansi = require('sisteransi');
const kleur = require('kleur');

const pack = require('../../package.json');

const stepBanners = [
  {
    name: 'Step 1',
    description: 'Load the template',
  },
  {
    name: 'Step 2',
    description: 'Gather parameters',
  },
  {
    name: 'Step 3',
    description: 'Generate Module',
  },
  {
    name: 'Step 4',
    description: 'Initialize git',
  },
  {
    name: 'Step 5',
    description: 'Install, build and test the module, this may take a minute',
  },
  {
    name: 'Step 6',
    description: 'Initial Commit',
  },
];

const fullBanner = `
 _   _     _               _____                    _       _
| | | |___(_)_ __   __ _  |_   _|__ _ __ ___  _ __ | | __ _| |_ ___
| | | / __| | '_ \\ / _\` |   | |/ _ \\ '_ \` _ \\| '_ \\| |/ _\` | __/ _ \\
| |_| \\__ \\ | | | | (_| |   | |  __/ | | | | | |_) | | (_| | ||  __/
 \\___/|___/_|_| |_|\\__, |   |_|\\___|_| |_| |_| .__/|_|\\__,_|\\__\\___|
                   |___/                     |_|              v${pack.version}`;

const smallBanner = `Generator Version: v${pack.version}`;

const goToStep = (step, templateBanner = undefined) => {
  if (stepBanners[step - 1] !== undefined) {
    console.log(ansi.erase.screen);
    if (templateBanner) {
      console.log(templateBanner);
      console.log(smallBanner);
    } else {
      console.log(fullBanner);
    }
    console.log('');
    const coloredSteps = stepBanners.map(({ name }, index) => {
      let text = name;
      if (index + 1 === step) {
        text = kleur.green().bold().underline(text);
      }
      return text;
    });
    console.log(coloredSteps.join(' -> '));
    console.log(stepBanners[step - 1].description);
    console.log('_'.repeat(80)); // the 'standard' terminal is 70 wide
  }
};

module.exports = {
  goToStep,
};
