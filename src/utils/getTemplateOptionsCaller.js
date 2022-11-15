const prompts = require('prompts');
const handleFlags = require('./handle-template-flags');

const getTemplateOptionsWithFlags = async (getTemplateOptions, flags, storedValues) => {
  /* eslint-disable no-param-reassign -- it's possible that flags is undefined */
  if (flags === undefined || flags.noBaseData === undefined) {
    flags = { noBaseData: false };
  }
  /* eslint-enable no-param-reassign -- re-enable */

  const baseData = await handleFlags(flags);
  if (flags.noBaseData === true) {
    return getTemplateOptions(prompts, storedValues);
  }
  return getTemplateOptions(baseData, prompts, storedValues);
};
module.exports = getTemplateOptionsWithFlags;
