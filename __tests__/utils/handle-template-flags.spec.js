const handleFlags = require('../../src/utils/handle-template-flags')
const getTemplateOptionsWithFlags = require('../../src/utils/getTemplateOptionsCaller')
const generateFromTemplate = require('../../src/generate-from-template');
jest.mock('../../src/utils/handle-template-flags')
jest.mock('prompts', () => 'promptsMock');
jest.mock('../../src/utils/log', () => ({
    goToStep: jest.fn(),
}));
jest.mock('../../src/utils/install-template', () => jest.fn());
jest.mock('../../src/utils/install-module', () => jest.fn());
//jest.mock('../../src/utils/get-base-options', () => jest.fn(() => 'baseOptionsMock'));
jest.mock('../../src/utils/walk-template', () => jest.fn());
jest.mock('../../src/utils/renameDirectories', () => jest.fn());
jest.mock('../../src/utils/git', () => ({
    initializeGitRepo: jest.fn(),
    createInitialCommit: jest.fn(),
}));
jest.mock('ejs', () => {
    const lifecycleMockFns = {
        preGenerate: jest.fn(),
        postGenerate: jest.fn(),
        preGitInit: jest.fn(),
        postGitInit: jest.fn(),
        preInstall: jest.fn(),
        postInstall: jest.fn(),
        preCommit: jest.fn(),
        postCommit: jest.fn(),
    };
    
    return {
        getTemplateOptions: jest.fn(() => ({
            templateValues: { projectName: 'projectNameMock' },
            dynamicFileNames: 'dynamicFileNamesMock',
            ignoredFileNames: 'ignoredFileNamesMock',
            dynamicDirectoryNames: { dynamicDirectoryName: 'dynamicDirectoryNameRename' },
            ignoredDirectories: [],
            lifecycle: lifecycleMockFns,
        })),
        getTemplatePaths: jest.fn(() => ['path1Mock', 'path2Mock']),
        lifecycleMocks: lifecycleMockFns,
    };
});
//let templatePackage = require('ejs');
describe('defaults', () => {

    it('should have default flags param', async () => {
        // await generateFromTemplate({ templateName: 'ejs@1.0.0' });
        // })
        //getTemplateOptionsWithFlags
        await generateFromTemplate({ templateName: 'ejs@1.0.0' });
      
        expect(handleFlags).toHaveBeenCalledWith({ noBaseData: false })

    });

})
