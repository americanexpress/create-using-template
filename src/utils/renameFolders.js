const path = require('path');
const fs = require('fs');
const {
  isDirectory,
  renameDirectory,
  getDynamicFolderName,
} = require('./directory');

const renameFolders = (
  templateRootPath, templateOptions
) => {
  fs.readdirSync(templateRootPath).forEach((fileName) => {
    let filePath = path.join(templateRootPath, fileName);
    if (isDirectory(filePath)) {
      const directoryName = path.basename(filePath);
      const dynamicDirectoryName = getDynamicFolderName(directoryName, templateOptions);
      if (directoryName !== dynamicDirectoryName) {
        const dynamicFolderPath = path.join(path.dirname(filePath), dynamicDirectoryName);
        renameDirectory(filePath, dynamicFolderPath);
        filePath = dynamicFolderPath;
      }
      renameFolders(
        filePath,
        templateOptions
      );
    }
  });
};
module.exports = renameFolders;
