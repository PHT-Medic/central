# PHT API
This repository contains the Backend of the UI, including the microservices handling different tasks.
It communicates with some services of the PHT and need therefore to be configured properly, like described 
in the following sections.

## Installation
This package requires docker to be installed on the host machine.

## Configuration
The following settings need to be added to the environment section of the docker-compose file.
```
PORT=<port>
NODE_ENV=<development|production>

API_URL=http://localhost:<port>/
WEB_APP_URL=http://localhost:<ui port>/

VAULT_CONNECTION_STRING=<token>@<api url>
RABBITMQ_CONNECTION_STRING=amqp://<username>:<password>@<host>
HARBOR_CONNECTION_STRING=<user>:<password>@<api url>

```

## Setup
To setup the database and other parts of the backend, run the following command:
```
docker-compose run app setup
```
This will setup everything you need.

## Start
To run the Backend just execute the following command:
 ```
docker-compose up
```

## Credits
If you have any questions, feel free to contact the author Peter Placzek of the project.
The project was initial developed during this bachelor thesis, and he worked after that as employee
on the project.
