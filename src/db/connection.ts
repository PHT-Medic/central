import Knex from 'knex';
import config from './knexfile';

const environment: string = process.env.ENVIRONMENT || 'development';

let environmentConfig: Knex.Config;
switch (environment) {
    case 'production':
        environmentConfig = config.production;
        break;
    case 'staging':
        environmentConfig = config.staging;
        break;
    default:
        environmentConfig = config.development;
        break;
}

export default Knex(environmentConfig);