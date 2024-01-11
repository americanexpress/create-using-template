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
const { goToStep } = require('../../src/utils/log');

jest.mock('../../package.json', () => ({
  version: 'packageVersionMock',
}));

jest.mock('kleur', () => ({
  green: jest.fn(() => ({
    bold: jest.fn(() => ({
      underline: (string) => string,
    })),
  })),
}));

const TOTAL_EXPECTED_STEPS = 6;

describe('log functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    kleur.enabled = false; // color support for unit tests is flaky, disable color for snapshots
  });

  describe('stepBanner', () => {
    for (let i = 1; i <= TOTAL_EXPECTED_STEPS; i += 1) {
      it(`outputs correct string for step ${i}`, () => {
        goToStep(i);
        expect(console.log.mock.calls.join('\n')).toMatchSnapshot();
      });
    }

    it('outputs the correct string when not given a templateBanner', () => {
      goToStep(1);
      expect(console.log.mock.calls.join('\n')).toMatchInlineSnapshot(`
"[2J

 _   _     _               _____                    _       _
| | | |___(_)_ __   __ _  |_   _|__ _ __ ___  _ __ | | __ _| |_ ___
| | | / __| | '_ \\ / _\` |   | |/ _ \\ '_ \` _ \\| '_ \\| |/ _\` | __/ _ \\
| |_| \\__ \\ | | | | (_| |   | |  __/ | | | | | |_) | | (_| | ||  __/
 \\___/|___/_|_| |_|\\__, |   |_|\\___|_| |_| |_| .__/|_|\\__,_|\\__\\___|
                   |___/                     |_|              vpackageVersionMock

Step 1 -> Step 2 -> Step 3 -> Step 4 -> Step 5 -> Step 6
Load the template
________________________________________________________________________________"
`);
    });

    it('outputs the correct string when given a templateBanner', () => {
      goToStep(1, 'BannerMock');
      expect(console.log.mock.calls.join('\n')).toMatchInlineSnapshot(`
        "[2J
        BannerMock
        Generator Version: vpackageVersionMock

        Step 1 -> Step 2 -> Step 3 -> Step 4 -> Step 5 -> Step 6
        Load the template
        ________________________________________________________________________________"
      `);
    });

    it('should do nothing if called with an index out of range', () => {
      goToStep(0);
      goToStep(-1);
      goToStep(TOTAL_EXPECTED_STEPS + 1);
      goToStep('index');
      expect(console.log).toHaveBeenCalledTimes(0);
    });
  });
});
