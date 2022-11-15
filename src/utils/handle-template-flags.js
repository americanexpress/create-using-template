const getBaseOptions = require('./get-base-options');

const handleFlags = async (flags) => {
  if (flags.noBaseData === false) {
    return getBaseOptions();
  }
  return Promise.resolve();
};

module.exports = handleFlags;
