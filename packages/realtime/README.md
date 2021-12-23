# UI - Realtime 👻
This repository contains the Realtime Application of the Central UI for the Personal Health Train (PHT).
It communicates with some services of the PHT and need therefore to be configured properly, like described
in the following sections.

## Configuration
The following settings need to be added to the environment file `.env` in the root directory.
```
PORT=<port>
NODE_ENV=<development|production>

API_URL=http://localhost:<port>/

REDIS_CONNECTION_STRING=redis://<username>:<password>@<host>
RABBITMQ_CONNECTION_STRING=amqp://<username>:<password>@<host>

```

## Credits
If you have any questions, feel free to contact the author [Peter Placzek](https://github.com/Tada5hi) of the project.
