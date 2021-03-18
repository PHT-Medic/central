import {Station} from "../../../domains/pht/station";
import {useVaultApi} from "../../api/provider/vault";
import {parseHarborConnectionString, useHarborApi} from "../../api/provider/harbor";
import env from "../../../env";

export async function saveStationPublicKeyToVault(entity: Station) {
    if (!!entity.public_key) {
        await useVaultApi()
            .post('station_pks/' + entity.id, {
                data: {
                    rsa_station_public_key: entity.public_key
                },
                options: {
                    "cas": 1
                }
            });
    }
}

export async function removeStationPublicKeyFromVault(entity: Station) {
    if(!!entity.public_key) {
        await useVaultApi()
            .delete('station_pks/'+entity.id);
    }
}

export async function ensureHarborProject(entity: Station) {
    const projectName : string = 'station_'+entity.id;

    try {
        await useHarborApi()
            .post('projects', {
                project_name: projectName,
                public: true
            });
    } catch (e) {
        console.log(e);
        await useHarborApi()
            .post('projects', {
                project_name: projectName,
                public: true
            });
    }
}

export async function removeHarborProject(entity: Station) {
    const name : string = 'station_'+entity.id;
    const response = await useHarborApi().get('projects?name='+name+'&page_size=1');
    if(Array.isArray(response.data) && response.data.length === 1 && response.data[0].project_name === name) {
        await useHarborApi()
            .delete('projects/'+response.data[0].project_id)
    }
}

export async function ensureHarborWebHook(entity: Station) {
    const projectName : string = 'station_'+entity.id;

    const result = await useHarborApi()
        .get('projects?name=' + projectName);

    if (Array.isArray(result) && result.length === 1) {
        const project = result[0];

        const {project_id: projectId} = project;

        const harborConfig = parseHarborConnectionString(env.harborConnectionString);

        const webhook: Record<string, any> = {
            name: "UI",
            enabled: true,
            project_id: projectId,
            targets: [
                {
                    auth_header: "Bearer " + harborConfig.token,
                    skip_cert_verify: true,
                    address: env.apiUrl + "service/harbor/hook",
                    type: "http"
                }
            ],
            event_types: ["PUSH_ARTIFACT"]
        }

        try {
            await useHarborApi()
                .post('projects/' + projectId + '/webhook/policies', webhook);
        } catch (e) {
            await useHarborApi()
                .put('projects/' + projectId + '/webhook/policies', webhook);
        }
    }
}
