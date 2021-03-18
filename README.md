# PHT Result Service
This repository contains the Result Service of the UI.
It communicates with some services of the PHT and need therefore to be configured properly, like described 
in the following sections.

## Installation
This package requires docker to be installed on the host machine.

## Configuration
The following settings need to be added to the environment section of the docker-compose file.
```
PORT=3003
NODE_ENV=development

VAULT_CONNECTION_STRING=s.jmMOV4W43R2zQ2WOuSQMwsV9@https://vault.pht.medic.uni-tuebingen.de/v1/
RABBITMQ_CONNECTION_STRING=amqp://pht:start123@193.196.20.19
HARBOR_CONNECTION_STRING=pht:PangerLenis32@https://harbor.personalhealthtrain.de/api/v2.0/

```

## Setup
To setup the database and other parts of the backend, run the following command:
```
$ docker network create --driver bridge pht-network
```
This will setup everything you need.

## Start
To run the Backend just execute the following command:
 ```
$ docker-compose up
```

## Credits
If you have any questions, feel free to contact the author Peter Placzek of the project.
The project was initial developed during this bachelor thesis, and he worked after that as employee
on the project.
