const getBaseOptions = require('./get-base-options');

const handleFlags = async (flags = {noBaseData:false}) => {
  if (flags.noBaseData === false) {
    return getBaseOptions();
  }
  console.warn('get base options has been disabled, make sure to get a project name in your template through prompts.');
  return Promise.resolve();
};

module.exports = handleFlags;
