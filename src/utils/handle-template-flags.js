const getBaseOptions = require('./get-base-options');

const handleFlags = async (flags, options) => {
  if (flags.noBaseData === false) {
    return getBaseOptions(options);
  }
  return Promise.resolve();
};

module.exports = handleFlags;
