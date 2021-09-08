const config = require('../commitlint.config');

describe('commitlint config', () => {
  it('should match ths snapshot', () => {
    expect(config).toMatchSnapshot();
  });
});
