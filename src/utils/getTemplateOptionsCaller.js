const prompts = require('prompts');
const handleFlags = require('./handle-template-flags');

const getTemplateOptionsWithFlags = async ({
  getTemplateOptions,
  flags = { noBaseData: false },
  storedValues,
  options,
}) => {
  const baseData = await handleFlags(flags, options);
  if (flags.noBaseData === true) {
    return getTemplateOptions(prompts, storedValues, options);
  }
  return getTemplateOptions(baseData, prompts, storedValues, options);
};
module.exports = getTemplateOptionsWithFlags;
