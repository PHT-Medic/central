/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {buildAuthorizationHeaderValue} from "@typescript-auth/core";

import {Client} from "../../../../auth"
import {useHarborApi} from "../../../../../modules";
import {BaseService} from "../../../type";
import {HarborProjectWebhookOptions} from "./type";

const WEBHOOK_ID = 'UI';

export type HarborProjectPolicy = {
    id: number,
    name: string,
    projectId: number
}

export async function findHarborProjectWebHook(
    projectIdOrName: number | string,
    isProjectName: boolean = false
) : Promise<HarborProjectPolicy | undefined> {
    const headers : Record<string, any> = {};

    if(isProjectName) {
        headers['X-Is-Resource-Name'] = true;
    }

    const { data } = await useHarborApi()
        .get('projects/' + projectIdOrName + '/webhook/policies', headers);

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

export async function ensureHarborProjectWebHook(
    projectIdOrName: number | string,
    client: Pick<Client, 'id' | 'secret'>,
    options: HarborProjectWebhookOptions,
    isProjectName: boolean = false
) {
    const headers : Record<string, any> = {};

    if(isProjectName) {
        headers['X-Is-Resource-Name'] = true;
    }

    const apiUrl : string | undefined = options.internalAPIUrl ?? options.externalAPIUrl;
    if(!apiUrl) {
        throw new Error('An API Harbor URL must be specified.');
    }

    const webhook: Record<string, any> = {
        name: WEBHOOK_ID,
        enabled: true,
        targets: [
            {
                auth_header: buildAuthorizationHeaderValue({type: "Basic", username: client.id, password: client.secret}),
                skip_cert_verify: true,
                // todo: change this, if service not on same machine.
                address: apiUrl + "services/"+BaseService.HARBOR+"/hook",
                type: "http"
            }
        ],
        event_types: ["PUSH_ARTIFACT"]
    }

    try {
        await useHarborApi()
            .post('projects/' + projectIdOrName + '/webhook/policies', webhook, headers);
    } catch (e) {
        if(e.response.status === 409) {
            const existingWebhook = await findHarborProjectWebHook(projectIdOrName, isProjectName);

            await useHarborApi()
                .put('projects/' + projectIdOrName + '/webhook/policies/'+existingWebhook.id, webhook, headers);

            return;
        }

        throw e;
    }
}

export async function dropHarborProjectWebHook(projectIdOrName: number | string, isProjectName: boolean = false) {
    const headers : Record<string, any> = {};

    if(isProjectName) {
        headers['X-Is-Resource-Name'] = true;
    }

    const webhook = await findHarborProjectWebHook(projectIdOrName, isProjectName);

    if(typeof webhook !== 'undefined') {
        await useHarborApi()
            .delete('projects/' + projectIdOrName+ '/webhook/policies/' + webhook.id, headers);
    }
}
