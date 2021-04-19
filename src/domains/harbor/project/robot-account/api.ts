import {Station} from "../../../pht/station";
import {useHarborApi} from "../../../../modules/api/provider/harbor";

//------------------------------------------------------------------------

export type HarborRobotAccount = {
    id?: string,
    name: string,
    token: string | null
}

export async function findHarborProjectRobotAccount(projectId: number, projectAccountName: string) : Promise<HarborRobotAccount|undefined> {
    const {data} = await useHarborApi().get('projects/'+projectId+'/robots?name='+projectAccountName+'&page_size=1');

    const accounts = Array.isArray(data) ? data.filter(account => account.name === projectAccountName) : [];

    if(
        accounts.length === 1
    ) {
        return {
            id: accounts[0].id,
            name: accounts[0].name,
            token: null
        }
    }

    return undefined;
}

export async function ensureHarborProjectRobotAccount(station: Station) : Promise<HarborRobotAccount> {
    const robot: Record<string, any> = {
        name: "station"+station.id,
        expires_at: -1,
        access: [
            {resource: '/project/'+station.harbor_project_id+'/repository', action: 'push'},
            {resource: '/project/'+station.harbor_project_id+'/repository', action: 'pull'},
            {resource: '/project/'+station.harbor_project_id+'/helm-chart', action: 'read'},
            {resource: '/project/'+station.harbor_project_id+'/helm-chart-version', action: 'create'}
        ]
    };

    try {
        const {data} = await useHarborApi()
            .post('projects/' + station.harbor_project_id + '/robots', robot);

        console.log(data);
        const { name } = data;
        let token : string | undefined;

        if(data.hasOwnProperty('secret')) {
            token = data.secret;
        }

        if(data.hasOwnProperty('token')) {
            token = data.token;
        }

        if(typeof token === 'undefined') {
            throw new Error('No robot account token generated.');
        }

        return {
            name,
            token
        };
    } catch (e) {
        if(e.response.status === 409) {
            try {
                await dropHarborProjectRobotAccount(station);
                return await ensureHarborProjectRobotAccount(station);
            } catch (e) {
                throw e;
            }
        }

        console.log(e.response.status);

        throw e;
    }
}

export async function dropHarborProjectRobotAccount(station: Station) : Promise<void> {
    if(!station.harbor_project_id) return;

    const accountName : string = station.harbor_project_account_name ?? "robot$station"+station.id;

    const robotAccount = await findHarborProjectRobotAccount(station.harbor_project_id, accountName);

    if(typeof robotAccount !== 'undefined') {
        await useHarborApi()
            .delete('projects/'+station.harbor_project_id+'/robots/'+robotAccount.id)
    }
}
