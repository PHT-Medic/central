import {Station} from "../../../station";
import {useHarborApi} from "../../../../modules/api/service/harbor";
import env from "../../../../env";
import {BaseService} from "../../../service";

const WEBHOOK_ID = 'UI';

export type HarborProjectPolicy = {
    id: number,
    name: string,
    projectId: number
}

export async function findHarborProjectWebHook(harborProjectId: number) : Promise<HarborProjectPolicy | undefined> {
    const { data } = await useHarborApi()
        .get('projects/' + harborProjectId + '/webhook/policies');

    const policies = data.filter((policy: { name: string; }) => policy.name === WEBHOOK_ID);

    if(policies.length === 1) {
        const policy = policies[0];

        return {
            id: policy.id,
            name: policy.name,
            projectId: policy.project_id
        }
    }

    return undefined;
}

export async function ensureHarborProjectWebHook(entity: Station, clientSecret: string) {
    const webhook: Record<string, any> = {
        name: WEBHOOK_ID,
        enabled: true,
        project_id: entity.harbor_project_id,
        targets: [
            {
                auth_header: "Secret " + clientSecret,
                skip_cert_verify: true,
                // todo: change this, if service not on same machine.
                address: env.internalApiUrl + "services/"+BaseService.HARBOR+"/hook",
                type: "http"
            }
        ],
        event_types: ["PUSH_ARTIFACT"]
    }

    try {
        await useHarborApi()
            .post('projects/' + entity.harbor_project_id + '/webhook/policies', webhook);
    } catch (e) {
        if(e.response.status === 409) {
            await useHarborApi()
                .put('projects/' + entity.harbor_project_id + '/webhook/policies', webhook);

            return;
        }

        throw e;
    }
}

export async function dropHarborProjectWebHook(projectId: number) {
    const webhook = await findHarborProjectWebHook(projectId);

    if(typeof webhook !== 'undefined') {
        await useHarborApi()
            .delete('projects/' + projectId+ '/webhook/policies/' + webhook.id);
    }
}
