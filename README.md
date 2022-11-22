<h1 align="center">
  <img src="./create-using-template.png" alt="Create Using template - One Amex" width="50%" />
</h1>

[![npm version](https://badge.fury.io/js/create-using-template.svg)](https://badge.fury.io/js/create-using-template)
[![CodeQL](https://github.com/americanexpress/create-using-template/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/americanexpress/create-using-template/actions/workflows/codeql-analysis.yml)
[![Tests](https://github.com/americanexpress/create-using-template/actions/workflows/tests.yml/badge.svg)](https://github.com/americanexpress/create-using-template/actions/workflows/tests.yml)

> A simple project generator.

## 👩‍💻 Hiring 👨‍💻

Want to get paid for your contributions to `one-app`?

> Send your resume to oneamex.careers@aexp.com

## 📖 Table of Contents

* [Features](#-features)
* [Usage](#-features)
* [Authoring Templates](#%EF%B8%8F-authoring-templates)
* [Contributing](#-contributing)
* [License](#%EF%B8%8F-license)
* [Code of Conduct](#%EF%B8%8F-code-of-conduct)

<br />

## ✨ Features

* Rapidly generate project repositories from simple templates.
* Simple command line interface. Compatible with `npm init`.
* Leverages npm packages as templates for distribution and management.

<br />

## 🤹‍ Usage

`one-app-module-template` can be replaced with any valid template package (see [below](#%EF%B8%8F-authoring-templates) for how to create a valid template)

```bash
npm init using-template one-app-module-template@5
```

## 🎛️ Authoring Templates

A template is any npm package whose default export follows the below API.

```js
module.exports = {
  getTemplatePaths,
  getTemplateOptions,
  getTemplateBanner,
};
```

### `getTemplatePaths`

`() => ([...'path'])`

#### return

getTemplatePaths should return an array of paths to your templates.

Each template will be processed left to right, with latter templates overwriting files written by earlier ones.

In most cases it will be sufficient to simply have one template path.

The files in a template path will be recursively walked.

If the file name has the .ejs suffix then this suffix will be removed, and this file will be executed by ejs with the `templateValues` returned by `getTemplateOptions`(see below).

Directory structures will be copied exactly, and files will be placed in the same directory in the output as they were in the template.

It is possible to define dynamic file names, and ignore files, based upon user input (see `getTemplateOptions` below)

### `getTemplateOptions`

`async (baseData, prompts, storedValues, options) => ({templateValues[, generatorOptions, dynamicFileNames, ignoredFileNames]})`

getTemplateOptions will be called to allow your template to configure its dynamic values.

#### Parameters

getTemplateOptions will be passed 2 parameters

##### `baseData`

baseData is an object containing the values received from the base prompts.

At this time the only piece of base data is `projectName`

##### `prompts`

prompts is a reference to the `prompts` library. Your template should call this to prompt the user for any dynamic values you need.

You should merge baseData with the result of the prompts your template needs, and return this under the `templateValues` key

##### `storedValues`

`storedValues` is an object containing responses that were stored with a previous generation of your template.
Your template can use these values to prepopulate prompts for your users, or even skip the prompts all together.

create-using-template will automatically store responses in the `~/.create-using-template/` directory. The stored responses will be saved for each major version of your template. So if your template has v1.0.0 and v2.0.0, responses will be stored separately for each. This only applies for major versions. Any minor or patch versions will still share the stored responses.

Stored responses are not enabled by default. You must set the `storeResponses` field in `generatorOptions` to `true` in order to store responses.

##### `options`

Options passed in the CLI will be passed through here as an object.

```bash
npm init using-template my-template --projectName my-project
```

Will result in:

```js
{
  projectName: 'my-project'
}
```

These can be used to skip prompts. CUT does this with `projectName` like so:

```js
const baseOptions = await prompts([
  {
    type: options.projectName ? null : 'text',
    name: 'projectName',
    message: 'Enter your project\'s name. This will also be used as the directory name for the project:',
    initial: '',
  },
]);
return {
  projectName: options.projectName,
  ...baseOptions,
};
```

#### return

getTemplateOptions should return an object. `templateValues` is the only required key.

##### `templateValues` object, required

The combination of baseData and the result from your call to `prompts`. This is the object that will be passed to your EJS template files, so you must make sure that all the keys you expect are present in this object

for example, if you wished to ask the user if they want to include an eslint config, you would return the following object:

```js
let templateValues = {
    ...baseData,
    ...await prompts([
      {
        type: 'text',
        name: 'eslint',
        message: 'Do you want an eslint config (y/n)',
        initial: '',
      },
    ]),
  };
```

##### `templateFlags`

template flags is an object that contains flags that you can pass from the template to to disable or enable specific interaction.

currently the only flag available to be set is `noBaseData`. If set this ignores the collection of the value `projectName` allowing you to retrieve that information through the prompts package in your template itself.

```js
const templateFlags = { noBaseData: true }
module.exports = {
  getTemplateOptions,
  getTemplatePaths,
  getTemplateBanner,
  templateFlags
};
```

if `noBaseData` is set, `baseData` is no longer needed as a parameter when calling `getTemplateOptions` nor as a value in `templateValues`.

##### `generatorOptions` object, optional

These values allow you to configure the generator.

* `postGenerationMessage`: If specified, this string will be printed after all other output, you can use it to give final information to the user, such as 'run `npm run start` to get started'
* `defaultBranchName`: This string will be used as the branch name for the git initialization. Defaults to main `main`
* `initialCommitMessage`: This string will be used as the commit message for the initial git commit. Defaults to `feat(generation): initial commit`
* `initialCommitOptions`: Array of additional git options to be passed to the initial commit.
* `storeResponses`: If this is set to `true`, create-using-template will store any responses for your template for future template generations.

##### `lifecycle` object<function>, optional

These async functions will run at specific stages of the generation lifecycle. `pre` functions can return `{ skip: true }` to skip that lifecycle stage. The generation stage cannot be skipped. If a lifecycle stage is skipped, its `post` function will not be called.

* `preGenerate`: runs before the module is generated. Generation cannot be skipped.
* `postGenerate`: runs after the module is generated.
* `preGitInit`: runs before initializing the git repo. Skipping this stage will also skip the commit stage, including `preCommit`.
* `postGitInit`: runs after initializing the git repo.
* `preInstall`: runs before installing the module.
* `postInstall`: runs after install.
* `preCommit`: runs before creating the initial commit.
* `postCommit`: runs after creating the initial commit.

##### `dynamicFileNames` object<string, string>, optional

When the generator is ready to write a file to the users project, it will first check this object for a key matching the fileName it is to use. If the key is present, it will instead use the value against that key as the file name.

For example, if you have a file in your template called `RootComponent.jsx.ejs` that you wanted to dynamically rewrite to `{baseData.projectName}.jsx` you would return the following object:

```jsx
const dynamicFileNames = {
  'RootComponent.jsx': `${baseData.projectName}.jsx`,
};
```

Note that the key doesn't contain the .ejs suffix, as this will always be removed by the generator.

##### `dynamicDirectoryNames` object<string, string>, optional

When the generator has created a user project, it will check this object for a key matching the folder name it is to use. If the key is present, it will instead use the value against that key as the folder name.

For example, if you have a file in your template called `marketLocale` that you wanted to dynamically rewrite to `en-AU` you would return the following object:

```jsx
const dynamicDirectoryNames = {
  'marketLocale': `en-AU`,
};
```

Note that the folder name you provide should be the name itself, do not provide the path of the folder like `src/locale`, provide only name 'locale' along with the value you want it to be renamed with.
example - locale: 'en-US', also do not provide the folder names with spaces or folder names with capitals.

##### `ignoredFileNames` array<string>, optional

When the generator is ready to read a file from your template, it will first check this array for a string matching the fileName it is to use. If the key is a string, it will entirely skip this file.

For example, if you have a file in your template called `.eslintrc.json.ejs` that you only want to write if the user has asked for eslint you would return

```jsx
const ignoredFileNames = [];

if (templateValues.eslint !== 'y') {
  ignoredFiles.push('.eslintrc.json.ejs');
}
```

Note that the string does contain the .ejs suffix, since the ignore applies when reading the file, the string should exactly match the name of the file in your template.

##### `ignoredDirectories`

When the generator goes through your template, it will ignore any directories provided in this array. You should just list the name of the directory, not the preceding path.

Example:

```javascript
ignoredDirectories: ['Test', 'Welcome']
```

The above will ignore everything within the `Test` and `Welcome` directories located within the paths provided by your `getTemplatePaths` function.

### `getTemplateBanner` optional

`(kleur) => (<string>)`

The string returned from this function will be output as part of the banner the template outputs. It can be a multi line string, and generally should not exceed 80 characters wide.

The [kleur package](https://www.npmjs.com/package/kleur) package is provided so that the template can output a colorful banner.

If this function is not exported, no string will be rendered

## 🏆 Contributing

We welcome Your interest in the American Express Open Source Community on GitHub. Any Contributor to
any Open Source Project managed by the American Express Open Source Community must accept and sign
an Agreement indicating agreement to the terms below. Except for the rights granted in this
Agreement to American Express and to recipients of software distributed by American Express, You
reserve all right, title, and interest, if any, in and to Your Contributions. Please
[fill out the Agreement](https://cla-assistant.io/americanexpress/create-using-template).

## 🗝️ License

Any contributions made under this project will be governed by the
[Apache License 2.0](./LICENSE.txt).

## 🗣️ Code of Conduct

This project adheres to the [American Express Community Guidelines](./CODE_OF_CONDUCT.md). By
participating, you are expected to honor these guidelines.
