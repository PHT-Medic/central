# Result Service 🏭
This repository contains the Result Service of the Personal Health Train.
It communicates with some services of the PHT and need therefore to be configured properly, like described 
in the following sections.

## Installation
This package requires docker to be installed on the host machine.

## Configuration
The following settings need to be added to the environment file `.env` in the root directory.
```
PORT=<port>
NODE_ENV=development

RABBITMQ_CONNECTION_STRING=amqp://<username>:<password>@<host>
HARBOR_CONNECTION_STRING=<user>:<password>@<api url>
```

### Docker
To use the rabbitMQ-instance provided with the `docker-compose.yml` file,
change the following environment variables:
```
RABBITMQ_CONNECTION_STRING=amqp://admin:start123@rabbitmq
```

## Credits
If you have any questions, feel free to contact the author [Peter Placzek](https://github.com/Tada5hi) of the project.
The project was initially developed during his bachelor thesis, and he worked after that as employee
on the project.
