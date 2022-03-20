/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client, Config } from '@trapi/client';
import { APIConnectionStringError } from '../../error';
import { APIServiceHarborConfig } from './type';
import { HarborRobotAccountAPI } from './robot-account';
import { HarborProjectAPI } from './project';
import { HarborProjectWebHookAPI } from './project-webhook';
import { HarborProjectRepositoryAPI } from './project-repository';
import { HarborProjectArtifactAPI } from './project-artifact';

export function parseHarborConnectionString(connectionString: string) : APIServiceHarborConfig {
    const parts : string[] = connectionString.split('@');
    if (parts.length !== 2) {
        throw new APIConnectionStringError('Harbor connection string must be in the following format: user:password@host');
    }

    const host : string = parts[1];

    const authParts : string[] = parts[0].split(':');
    if (authParts.length !== 2) {
        throw new APIConnectionStringError('Harbor connection string must be in the following format: user:password@host');
    }

    return {
        host,
        user: authParts[0],
        password: authParts[1],
    };
}

export class HarborAPI extends Client {
    public readonly project: HarborProjectAPI;

    public readonly projectArtifact: HarborProjectArtifactAPI;

    public readonly projectRepository: HarborProjectRepositoryAPI;

    public readonly projectWebHook: HarborProjectWebHookAPI;

    public readonly robotAccount : HarborRobotAccountAPI;

    constructor(config: Config) {
        const harborConfig : APIServiceHarborConfig = parseHarborConnectionString(config.extra.connectionString);

        config.driver = {
            ...(config.driver ?? {}),
            baseURL: harborConfig.host,
        };

        super(config);

        this.setAuthorizationHeader({
            type: 'Basic',
            username: harborConfig.user,
            password: harborConfig.password,
        });

        this.project = new HarborProjectAPI(this.driver);
        this.projectArtifact = new HarborProjectArtifactAPI(this.driver);
        this.projectWebHook = new HarborProjectWebHookAPI(this.driver);
        this.projectRepository = new HarborProjectRepositoryAPI(this.driver);
        this.robotAccount = new HarborRobotAccountAPI(this.driver);
    }
}
