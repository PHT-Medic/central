# PHT - Central UI 🚀
This repository contains all packages for the Central-UI of the Personal Health Train (PHT).

## Installation
This package requires docker to be installed on the host machine.

## Configuration

Read the `Readme.md` in each package directory.

## Setup
To setup the database and other parts of the backend, run the following command:
```
$ docker network create --driver bridge pht-network

$ docker-compose run -d db
$ docker-compose run backend setup
```
This will setup everything you need.

## Start
To run all packages just execute the following command:
 ```
$ docker-compose up
```

## Credits
If you have any questions, feel free to contact the author & creator Peter Placzek of the project.
The project was initial developed during this bachelor thesis, and he worked after that time as employee
on the project.
