# UI - Backend 🌠
This repository contains the Central UI Backend API of the Personal Health Train (PHT).
It communicates with some services of the PHT and need therefore to be configured properly, like described 
in the following sections.

## Configuration
The following settings need to be added to the environment file `.env` in the root directory.
```
PORT=<port>
NODE_ENV=<development|production>

API_URL=http://localhost:<port>/
INTERNAL_API_URL=http://localhost:<port>/
WEB_APP_URL=http://localhost:<ui port>/

VAULT_CONNECTION_STRING=<token>@<api url>
RABBITMQ_CONNECTION_STRING=amqp://<username>:<password>@<host>
HARBOR_CONNECTION_STRING=<user>:<password>@<api url>

```

## Setup

```shell
$ npm run cli -- setup
```

## Credits
If you have any questions, feel free to contact the author [Peter Placzek](https://github.com/Tada5hi) of the project.
The project was initially developed during his bachelor thesis, and he worked after that as employee
on the project.
