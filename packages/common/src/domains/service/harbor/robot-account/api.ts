/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {useHarborApi} from "../../../../modules";

// ------------------------------------------------------------------------

export type HarborRobotAccount = {
    id?: string,
    name: string,
    secret?: string | null,
    creationTime: string,
    expires_at: number
}

export async function findHarborRobotAccount(name: string, withSecret: boolean = true) : Promise<HarborRobotAccount|undefined> {
    const {data} = await useHarborApi().get('robots?q=name%3D'+name+'&page_size=1');

    const accounts = Array.isArray(data) ? data.filter(account => account.name === 'robot$'+name) : [];

    if(
        accounts.length === 1
    ) {
        let secret : string | undefined;

        if(withSecret) {
            const patchedAccount = await patchHarborProjectRobotAccount(accounts[0].id);
            secret = patchedAccount.secret;
        }

        return {
            id: accounts[0].id,
            name: accounts[0].name,
            creationTime: accounts[0].creation_time,
            expires_at: accounts[0].expires_at,
            secret
        }
    }

    return undefined;
}

/**
 * Update harbor project robot account.
 * If no "record.secret" provided, a new secret is generated.
 *
 * @param robotId
 * @param record
 */
export async function patchHarborProjectRobotAccount(robotId: string | number, record: Record<string, any> = {}) : Promise<Pick<HarborRobotAccount, 'secret'>> {
    const robot : Record<string, any> = {
        ...record
    };

    const { data } : {data: HarborRobotAccount} = await useHarborApi()
        .patch('robots/'+robotId, robot);

    if(typeof record.secret !== 'undefined') {
        data.secret = record.secret;
    }

    return data as HarborRobotAccount;
}

export async function ensureHarborProjectRobotAccount(robotName: string, projectName?: string) {
    const robot: Record<string, any> = {
        name: robotName,
        duration: -1,
        level: "system",
        disable: false,
        permissions: [
            {
                access: [
                    {resource: 'artifact', action: 'delete'},
                    {resource: 'artifact-label', action: 'create'},
                    {resource: 'helm-chart', action: 'read'},
                    {resource: 'helm-chart-version', action: 'create'},
                    {resource: 'helm-chart-version', action: 'delete'},
                    {resource: 'repository', action: 'push'},
                    {resource: 'repository', action: 'pull'},
                    {resource: 'scan', action: 'create'},
                    {resource: 'tag', action: 'create'},
                    {resource: 'tag', action: 'delete'}

                ],
                kind: 'project',
                namespace: projectName ?? robotName
            }
        ]
    };

    const { data } : {data: HarborRobotAccount} = await useHarborApi()
        .post('robots', robot);

    return data;
}

export async function dropHarborProjectAccount(robotId: string | number) : Promise<void> {
    await useHarborApi()
        .delete('robots/'+robotId);
}
