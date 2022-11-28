const generateFromTemplate = require('../../src/generate-from-template');

jest.mock('../../src/generate-from-template', () => jest.fn());

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
    expect(generateFromTemplate).toHaveBeenNthCalledWith(1, { templateName: 'templateNameMock', options: {} });
  });
});
