# Central 🐋
This repository contains the main central packages of the Personal Health Train (PHT).

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

In addition, `Node.js` must be installed on the host machine, to start packages and to install required dependencies.
To install the dependencies, run:

```shell
$ npm i
```

To build all packages, run:

```shell
$ npm run build
```

## Configuration
Read the `README.md` in each package directory. Each package must be configured individually.

## Packages

### @personalhealthtrain/central-api 🌴
[![npm version](https://badge.fury.io/js/@personalhealthtrain%2Fcentral-api.svg)](https://badge.fury.io/js/@personalhealthtrain%2Fcentral-api)

This repository contains the central API. The API package contains aggregators, components and many more.

### @personalhealthtrain/central-common 🧱
[![npm version](https://badge.fury.io/js/@personalhealthtrain%2Fcentral-common.svg)](https://badge.fury.io/js/@personalhealthtrain%2Fcentral-common)

This repository contains common constants, functions, types, ...

### @personalhealthtrain/central-ui 🧸

[![npm version](https://badge.fury.io/js/@personalhealthtrain%2Fcentral-ui.svg)](https://badge.fury.io/js/@personalhealthtrain%2Fcentral-ui)

This repository contains the User Interface (UI).


### @personalhealthtrain/central-realtime 🚄

[![npm version](https://badge.fury.io/js/@personalhealthtrain%2Fcentral-realtime.svg)](https://badge.fury.io/js/@personalhealthtrain%2Fcentral-realtime)

This repository contains the realtime application which connects the API with socket based clients.

### @personalhealthtrain/central-train-manager 🏭

[![npm version](https://badge.fury.io/js/@personalhealthtrain%2Fcentral-result.svg)](https://badge.fury.io/js/@personalhealthtrain%2Fcentral-result)

This repository contains the train manager, which is responsible to route, build and extract a train.

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
If you have any questions, feel free to contact the author & creator [Peter Placzek](https://github.com/tada5hi)  of the project.
The project was initial developed during this bachelor thesis, and he worked after that time as employee
on the project.
