const path = require('path');
const fs = require('fs');
const {
  isDirectory,
  getDynamicDirectoryName,
} = require('./directory');

const renameDirectories = (
  templateRootPath, templateOptions
) => {
  fs.readdirSync(templateRootPath).forEach((fileName) => {
    let filePath = path.join(templateRootPath, fileName);
    if (isDirectory(filePath)) {
      const directoryName = path.basename(filePath);
      const dynamicDirectoryName = getDynamicDirectoryName(directoryName, templateOptions);
      if (directoryName !== dynamicDirectoryName) {
        const dynamicFolderPath = path.join(path.dirname(filePath), dynamicDirectoryName);
        fs.renameSync(filePath, dynamicFolderPath);
        filePath = dynamicFolderPath;
      }
      renameDirectories(
        filePath,
        templateOptions
      );
    }
  });
};
module.exports = renameDirectories;
