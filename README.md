# User Interface (UI) 🚀
This repository contains all packages of the Central-UI in context of the Personal Health Train (PHT).

[![npm version](https://badge.fury.io/js/@personalhealthtrain%2Fui-common.svg)](https://badge.fury.io/js/@personalhealthtrain%2Fui-common)
[![main](https://github.com/Tada5hi/pht-central-ui/actions/workflows/main.yml/badge.svg)](https://github.com/Tada5hi/pht-central-ui/actions/workflows/main.yml)
[![CodeQL](https://github.com/PHT-Medic/central-ui/actions/workflows/codeql.yml/badge.svg)](https://github.com/PHT-Medic/central-ui/actions/workflows/codeql.yml)
[![Known Vulnerabilities](https://snyk.io/test/github/Tada5hi/pht-central-ui/badge.svg)](https://snyk.io/test/github/Tada5hi/pht-central-ui)

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
$ git clone https://github.com/PHT-Medic/central-ui
$ cd central-ui
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

### @personalhealthtrain/ui-backend 🌠
This repository contains the backend application with REST API, aggregators, components and many more.

### @personalhealthtrain/ui-common 📦
[![npm version](https://badge.fury.io/js/@personalhealthtrain%2Fui-common.svg)](https://badge.fury.io/js/@personalhealthtrain%2Fui-common)

This repository contains common constants, functions, types, ... of the Personal Health Train (PHT) UI.

### @personalhealthtrain/ui-frontend 🍭
This repository contains the frontend application. 

### @personalhealthtrain/ui-realtime 🌠
This repository contains the realtime application which connects the backend application with socket based clients.

## Usage
Start the frontend-, backend-, & realtime-application in a single terminal window (or as background process) with the following command:
```shell
$ npm run backend
```

```shell
$ npm run frontend
```

```shell
$ npm run realtime
```

## Credits
If you have any questions, feel free to contact the author & creator Peter Placzek of the project.
The project was initial developed during this bachelor thesis, and he worked after that time as employee
on the project.
