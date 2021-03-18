import {EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent} from "typeorm";
import {Station} from "./index";
import {parseHarborConnectionString, useHarborApi} from "../../../modules/api/provider/harbor";
import {useVaultApi} from "../../../modules/api/provider/vault";
import env from "../../../env";

async function ensureServiceData(entity: Station, withHarbor: boolean = true) {
    if(!!entity.public_key) {
        await useVaultApi()
            .post('station_pks/'+entity.id, {
                data: {
                    rsa_station_public_key: entity.public_key
                },
                options: {
                    "cas": 1
                }
            });
    }

    const projectName = 'station_'+entity.id

    await useHarborApi()
        .post('projects', {
            project_name: projectName,
            public: true
        });

    const result = await useHarborApi()
        .get('projects?name='+projectName);

    if(Array.isArray(result) && result.length === 1) {
        const project = result[0];

        const { project_id:projectId } = project;

        const harborConfig = parseHarborConnectionString(env.harborConnectionString);

        const webhook : Record<string, any> = {
            enabled: true,
            targets: [
                {
                    "auth_header": "Bearer "+harborConfig.token,
                    "skip_cert_verify": true,
                    "address": env.apiUrl+"service/harbor/hook"
                }
            ],
            event_types: ["PUSH_ARTIFACT"]
        }

        await useHarborApi()
            .post('projects/'+projectId+'/webhook/policies', webhook);
    }
}

async function removeServiceData(entity: Station) {
    if(!!entity.public_key) {
        await useVaultApi()
            .delete('station_pks/'+entity.id);
    }

    const name = 'station_'+entity.id;
    const response = await useHarborApi().get('projects?name='+name+'&page_size=1');
    if(Array.isArray(response.data) && response.data.length === 1 && response.data[0].project_name === name) {
        await useHarborApi()
            .delete('projects/'+response.data[0].project_id)
    }
}

@EventSubscriber()
export class StationSubscriber implements EntitySubscriberInterface {
    listenTo(): Function | string {
        return Station;
    }

    afterInsert(event: InsertEvent<Station>) {
        ensureServiceData(event.entity)
            .catch(e => console.log(e));
    }

    afterUpdate(event: UpdateEvent<Station>): Promise<any> | void {
        ensureServiceData(event.entity, false)
            .catch(e => console.log(e));
    }

    beforeRemove(event: RemoveEvent<Station>) {
        removeServiceData(event.entity)
            .catch(e => console.log(e));
    }
}
