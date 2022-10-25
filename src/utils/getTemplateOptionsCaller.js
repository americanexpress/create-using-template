const prompts = require('prompts');
const handleFlags = require('./handle-template-flags');

const getTemplateOpt = async (getTemplateOptions, flags, storedValues) => {
  const baseData = await handleFlags(flags);
  if (flags.noBaseData === true) {
    return getTemplateOptions(prompts, storedValues);
  }
  return getTemplateOptions(baseData, prompts, storedValues);
};
module.exports = getTemplateOpt;
