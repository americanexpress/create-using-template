const promptsLib = require('prompts');
const { prompts, hasTheUserAborted } = require('../../src/utils/prompts');

jest.mock('prompts', () => jest.fn((_questions, opts) => opts));

describe('prompts wrapper', () => {
  it('calls the actual prompts', () => {
    const questions = [{
      testing: true,
    }];

    prompts(questions);

    expect(promptsLib).toHaveBeenCalledWith(questions, {
      onCancel: expect.any(Function),
    });
  });

  it('hasTheUserAborted returns false', () => {
    const questions = [{
      testing: true,
    }];

    prompts(questions);

    expect(hasTheUserAborted()).toBe(false);
  });

  it('hasTheUserAborted returns true', () => {
    const questions = [{
      testing: true,
    }];

    const { onCancel } = prompts(questions);

    onCancel();

    expect(hasTheUserAborted()).toBe(true);
  });
});
