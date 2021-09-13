const generateFromTemplate = require('../../src/generate-from-template');

jest.mock('../../src/generate-from-template', () => jest.fn());

describe('bin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should bootstrap the generation process by passing the cli parameters to generateFromTemplate', () => {
    process.argv = ['node', 'create-using-template', 'templateNameMock'];
    jest.isolateModules(() => {
      // eslint-disable-next-line import/no-unresolved, global-require
      require('../../bin');
    });
    expect(generateFromTemplate).toHaveBeenCalledTimes(1);
    expect(generateFromTemplate).toHaveBeenNthCalledWith(1, { templateName: 'templateNameMock' });
  });
  it('should catch and log exceptions thrown during generation', () => {
    process.argv = ['node', 'create-using-template', 'templateNameMock'];
    generateFromTemplate.mockImplementationOnce(() => new Promise((_, reject) => reject(new Error('ErrorMock'))));
    jest.spyOn(console, 'error').mockImplementationOnce(() => {}).mockImplementationOnce(() => {});
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {});

    jest.isolateModules(() => {
      // eslint-disable-next-line import/no-unresolved, global-require
      require('../../bin');
    });
    expect(generateFromTemplate).toHaveBeenCalledTimes(1);
    expect(generateFromTemplate).toHaveBeenNthCalledWith(1, { templateName: 'templateNameMock' });
  });
});
