# PHT - Web API 🚀
This repository contains the Backend API of the Personal Health Train (PHT).
It communicates with some services of the PHT and need therefore to be configured properly, like described 
in the following sections.

## Installation
This package requires docker to be installed on the host machine.

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

### Docker
To use the  database- and rabbitMQ-instance provided with the `docker-compose.yml` file,
change the following environment variables:
```
TYPEORM_HOST=db
RABBITMQ_CONNECTION_STRING=amqp://admin:start123@rabbitmq
```

## Credits
If you have any questions, feel free to contact the author Peter Placzek of the project.
The project was initial developed during this bachelor thesis, and he worked after that as employee
on the project.
