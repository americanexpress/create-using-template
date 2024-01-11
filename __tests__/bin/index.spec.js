/* eslint-disable eslint-comments/disable-enable-pair -- to exclude rule for the entire file */
/* eslint-disable no-underscore-dangle -- used for custom functions needed just for testing */
const generateFromTemplate = require('../../src/generate-from-template');
const prompts = require('../../src/utils/prompts');

jest.mock('../../src/generate-from-template', () => jest.fn());
jest.mock('../../src/utils/create-build-logger', () => () => ({
  addError: jest.fn(),
  addStep: jest.fn(),
  addTemplateDetails: jest.fn(),
  init: jest.fn(),
  moveBuildLogToProject: jest.fn(),
}));
jest.mock('../../src/utils/prompts', () => {
  let aborted = false;

  return {
    prompts: jest.fn(),
    hasTheUserAborted: () => aborted,
    _setAborted: (value) => {
      aborted = value;
    },
  };
});

const waitToResolve = () => new Promise((resolve) => {
  setTimeout(() => {
    resolve();
  });
});

describe('bin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should bootstrap the generation process by passing the cli parameters to generateFromTemplate', () => {
    process.argv = ['node', 'create-using-template', 'templateNameMock', '--projectName', 'mockProjectName'];
    jest.isolateModules(() => {
      // eslint-disable-next-line global-require -- we are testing `import time` code
      require('../../bin');
    });
    expect(generateFromTemplate).toHaveBeenCalledTimes(1);
    expect(generateFromTemplate).toHaveBeenNthCalledWith(1, {
      templateName: 'templateNameMock',
      options: { projectName: 'mockProjectName' },
      buildLogger: {
        addError: expect.any(Function),
        addStep: expect.any(Function),
        addTemplateDetails: expect.any(Function),
        init: expect.any(Function),
        moveBuildLogToProject: expect.any(Function),
      },
    });
  });

  it('should catch and log exceptions thrown during generation', async () => {
    process.argv = ['node', 'create-using-template', 'templateNameMock'];
    generateFromTemplate.mockImplementationOnce(() => new Promise((_, reject) => { reject(new Error('ErrorMock')); }));
    jest.spyOn(console, 'error').mockImplementationOnce(() => { }).mockImplementationOnce(() => { });
    jest.spyOn(process, 'exit').mockImplementationOnce(() => { });

    jest.isolateModules(() => {
      // eslint-disable-next-line global-require -- we are testing `import time` code
      require('../../bin');
    });

    await waitToResolve();

    expect(generateFromTemplate).toHaveBeenCalledTimes(1);
    expect(generateFromTemplate).toHaveBeenNthCalledWith(1, {
      templateName: 'templateNameMock',
      buildLogger: {
        addError: expect.any(Function),
        addStep: expect.any(Function),
        addTemplateDetails: expect.any(Function),
        init: expect.any(Function),
        moveBuildLogToProject: expect.any(Function),
      },
      options: {},
    });
    expect(console.error).toHaveBeenCalledTimes(2);
  });

  it('logs "bye bye" when user aborts / exists process', async () => {
    prompts._setAborted(true);

    process.argv = ['node', 'create-using-template', 'templateNameMock'];

    generateFromTemplate.mockImplementationOnce(() => new Promise((_, reject) => { reject(new Error('ErrorMock')); }));

    jest.spyOn(console, 'error').mockImplementationOnce(() => { });
    jest.spyOn(console, 'log').mockImplementationOnce(() => { });
    jest.spyOn(process, 'exit').mockImplementationOnce(() => { });

    jest.isolateModules(() => {
      // eslint-disable-next-line global-require -- we are testing `import time` code
      require('../../bin');
    });

    await waitToResolve();

    expect(generateFromTemplate).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith('Bye, bye!');
  });
});
