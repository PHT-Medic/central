[![main](https://github.com/PHT-Medic/central-result-service/actions/workflows/main.yml/badge.svg)](https://github.com/PHT-Medic/central-result-service/actions/workflows/main.yml)
# Result Service 🏭
This repository contains the Result Service of the Personal Health Train.
It communicates with some services of the PHT and need therefore to be configured properly, like described 
in the following sections.

**Table of Contents**

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
    - [Production](#production)
    - [Development](#development)

## Installation

```shell
git clone https://github.com/PHT-Medic/central-result-service
cd central-result-service
npm i
```

## Configuration
The following settings need to be added to the environment file `.env` in the root directory.
```
PORT=<port>
NODE_ENV=development

RABBITMQ_CONNECTION_STRING=amqp://<username>:<password>@<host>
HARBOR_CONNECTION_STRING=<user>:<password>@<api url>
```

## Usage

### Production

``` bash
# build application for production 🛠
npm run build

# run application ⚔
npm run start
```

### Development

``` bash
# serve application on the fly 🔥
npm run dev
````

## Credits
If you have any questions, feel free to contact the author [Peter Placzek](https://github.com/Tada5hi) of the project.
The project was initially developed during his bachelor thesis, and he worked after that as employee
on the project.
