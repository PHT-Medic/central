import {useHarborApi} from "../../../../modules/api/service/harbor";
import {createHarborProjectNameByStationId} from "../api";

//------------------------------------------------------------------------

export type HarborRobotAccount = {
    id?: string,
    name: string,
    secret?: string | null,
    creation_time: string,
    expires_at: number
}

export async function findHarborProjectRobotAccount(stationId: string | number) : Promise<HarborRobotAccount|undefined> {
    const name : string = createHarborProjectNameByStationId(stationId);
    const {data} = await useHarborApi().get('robots?q=name%3D'+name+'&page_size=1');

    const accounts = Array.isArray(data) ? data.filter(account => account.name === 'robot$'+name) : [];

    if(
        accounts.length === 1
    ) {
        return {
            id: accounts[0].id,
            name: accounts[0].name,
            creation_time: accounts[0].creation_time,
            expires_at: accounts[0].expires_at,
            secret: null
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
    let robot : Record<string, any> = {
        ...record
    };

    const { data } : {data: HarborRobotAccount} = await useHarborApi()
        .patch('robots/'+robotId, robot);

    if(typeof record.secret !== 'undefined') {
        data.secret = record.secret;
    }

    return data as HarborRobotAccount;
}

export async function ensureHarborProjectRobotAccount(stationId: string |number, iteration: number = 0) : Promise<HarborRobotAccount> {
    const name : string = createHarborProjectNameByStationId(stationId);
    const robot: Record<string, any> = {
        name,
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
                namespace: name
            }
        ]
    };

    try {
        const { data } : {data: HarborRobotAccount} = await useHarborApi()
            .post('robots', robot);

        return data;
    } catch (e) {
        if(iteration === 0) {
            if (e.response.status >= 400 && e.response.status < 500) {
                iteration++;
                await dropHarborProjectRobotAccount(stationId);
                await ensureHarborProjectRobotAccount(stationId, iteration);
            }
        }

        throw e;
    }
}

export async function dropHarborProjectRobotAccount(stationId: string | number) : Promise<void> {
    const robotAccount = await findHarborProjectRobotAccount(stationId);

    if(typeof robotAccount !== 'undefined') {
        await useHarborApi()
            .delete('robots/'+robotAccount.id);
    }
}
