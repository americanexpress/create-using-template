const generateFromTemplate = require('../../src/generate-from-template');

jest.mock('../../src/generate-from-template', () => jest.fn());
jest.mock('../../src/utils/create-build-logger', () => () => ({
  addError: jest.fn(),
  addStep: jest.fn(),
  addTemplateDetails: jest.fn(),
  init: jest.fn(),
  moveBuildLogToProject: jest.fn(),
}));

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
  it('should catch and log exceptions thrown during generation', () => {
    process.argv = ['node', 'create-using-template', 'templateNameMock'];
    generateFromTemplate.mockImplementationOnce(() => new Promise((_, reject) => reject(new Error('ErrorMock'))));
    jest.spyOn(console, 'error').mockImplementationOnce(() => {}).mockImplementationOnce(() => {});
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {});

    jest.isolateModules(() => {
      // eslint-disable-next-line global-require -- we are testing `import time` code
      require('../../bin');
    });
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
  });
});
