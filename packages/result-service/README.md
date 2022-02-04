# UI - Result Service 🏭

[![npm version](https://badge.fury.io/js/@personalhealthtrain%2Fui-result-service.svg)](https://badge.fury.io/js/@personalhealthtrain%2Fui-result-service)

This repository contains the Result Service of the Personal Health Train.
It communicates with some services of the PHT and need therefore to be configured properly, like described 
in the following sections.

## Configuration
The following settings need to be added to the environment file `.env` in the root directory.
```
PORT=<port>
NODE_ENV=development

RABBITMQ_CONNECTION_STRING=amqp://<username>:<password>@<host>
HARBOR_CONNECTION_STRING=<user>:<password>@<url>
```

## Credits
If you have any questions, feel free to contact the author [Peter Placzek](https://github.com/Tada5hi) of the project.
The project was initially developed during his bachelor thesis, and he worked after that as employee
on the project.
