# Central 🚀
This repository contains all packages of the Central-UI in context of the Personal Health Train (PHT).

[![npm version](https://badge.fury.io/js/@personalhealthtrain%2Fcentral-common.svg)](https://badge.fury.io/js/@personalhealthtrain%2Fcentral-common)
[![main](https://github.com/PHT-Medic/central/actions/workflows/main.yml/badge.svg)](https://github.com/PHT-Medic/central/actions/workflows/main.yml)
[![CodeQL](https://github.com/PHT-Medic/central/actions/workflows/codeql.yml/badge.svg)](https://github.com/PHT-Medic/central/actions/workflows/codeql.yml)
[![Known Vulnerabilities](https://snyk.io/test/github/PHT-Medic/central/badge.svg)](https://snyk.io/test/github/PHT-Medic/central)

![](assets/ui.jpg)

**Table of Contents**

- [Installation & Build](#installation--build)
- [Configuration](#configuration)
- [Packages](#packages)
- [Usage](#usage)
- [Credits](#credits)

## Installation & Build
Download the source code.

```shell
$ git clone https://github.com/PHT-Medic/central
$ cd central
```

To start a package (frontend, backend), `nodejs` must be installed on the host machine.
Nodejs is also required to install all dependencies, with the following command.

```shell
$ npm i
```

Build all packages.

```shell
$ npm run build
```

## Configuration
Read the `Readme.md` in each package directory and configure each package individually.

## Packages

### @personalhealthtrain/central-api 🌠
[![npm version](https://badge.fury.io/js/@personalhealthtrain%2Fcentral-api.svg)](https://badge.fury.io/js/@personalhealthtrain%2Fcentral-api)

This repository contains the backend application with REST API, aggregators, components and many more.

### @personalhealthtrain/central-common 📦
[![npm version](https://badge.fury.io/js/@personalhealthtrain%2Fcentral-common.svg)](https://badge.fury.io/js/@personalhealthtrain%2Fcentral-common)

This repository contains common constants, functions, types, ... of the Personal Health Train (PHT) UI.

### @personalhealthtrain/central-ui 🍭

[![npm version](https://badge.fury.io/js/@personalhealthtrain%2Fcentral-ui.svg)](https://badge.fury.io/js/@personalhealthtrain%2Fcentral-ui)

This repository contains the frontend application.


### @personalhealthtrain/central-realtime 🌠

[![npm version](https://badge.fury.io/js/@personalhealthtrain%2Fcentral-realtime.svg)](https://badge.fury.io/js/@personalhealthtrain%2Fcentral-realtime)

This repository contains the realtime application which connects the backend application with socket based clients.

### @personalhealthtrain/central-result 🏭

[![npm version](https://badge.fury.io/js/@personalhealthtrain%2Fcentral-result.svg)](https://badge.fury.io/js/@personalhealthtrain%2Fcentral-result)

This repository contains the Result Service of the Personal Health Train.

## Usage
Start the ui-, api-, & realtime-application in a single terminal window (or as background process) with the following command:
```shell
$ npm run api
```

```shell
$ npm run ui
```

```shell
$ npm run realtime
```

```shell
$ npm run result
```

## Credits
If you have any questions, feel free to contact the author & creator Peter Placzek of the project.
The project was initial developed during this bachelor thesis, and he worked after that time as employee
on the project.
