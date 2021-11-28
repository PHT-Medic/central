[![main](https://github.com/Tada5hi/pht-central-ui/actions/workflows/main.yml/badge.svg)](https://github.com/Tada5hi/pht-central-ui/actions/workflows/main.yml)
[![CodeQL](https://github.com/PHT-Medic/central-ui/actions/workflows/codeql.yml/badge.svg)](https://github.com/PHT-Medic/central-ui/actions/workflows/codeql.yml)
[![Known Vulnerabilities](https://snyk.io/test/github/Tada5hi/pht-central-ui/badge.svg)](https://snyk.io/test/github/Tada5hi/pht-central-ui)

# User Interface (UI) 🚀
This repository contains all packages of the Central-UI for the Personal Health Train (PHT).

[Overview](assets/ui.jpg)

## Installation
Download the source code.

```shell
git clone https://github.com/PHT-Medic/central-ui
cd central-ui
```

To start a package (frontend, backend), `nodejs` must be installed on the host machine.
Nodejs is also required to install all dependencies, with the following command.

```shell
$ npm i
```

## Build
Build the packages.

```shell
$ npm run build
$ npm run setup --workspace=packages/backend
```

## Configuration
Read the `Readme.md` in each package directory.

## Run
Start the frontend- & backend application in a single terminal window (or as background process) with the following command:
```shell
$ npm run start --workspace=packages/backend
```
```shell
$ npm run start --workspace=packages/frontend
```

## Credits
If you have any questions, feel free to contact the author & creator Peter Placzek of the project.
The project was initial developed during this bachelor thesis, and he worked after that time as employee
on the project.
