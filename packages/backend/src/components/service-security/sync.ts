/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {Message} from "amqp-extension";
import {
    BaseService, HARBOR_INCOMING_PROJECT_NAME,
    HARBOR_MASTER_IMAGE_PROJECT_NAME, HARBOR_OUTGOING_PROJECT_NAME,
    saveServiceSecretToVault,
    Station
} from "@personalhealthtrain/ui-common";
import {getRepository, IsNull, Not} from "typeorm";
import {ensureHarborProjectWebHook} from "@personalhealthtrain/ui-common";
import env from "../../env";

export async function syncServiceSecurity(message: Message) {
    const serviceId : number | string = message.data.id;
    const clientId : string = message.data.clientId;
    const clientSecret : string = message.data.clientSecret;

    switch (serviceId) {
        case BaseService.RESULT_SERVICE:
        case BaseService.TRAIN_BUILDER:
        case BaseService.TRAIN_ROUTER:
            await saveServiceSecretToVault(serviceId, {id: clientId, secret: clientSecret});
            break;
        case BaseService.HARBOR:
            const stationRepository = getRepository(Station);
            const stations = await stationRepository.find({
                harbor_project_id: Not(IsNull())
            });

            const promises : Promise<void>[] = stations.map((station: Station) => {
                return ensureHarborProjectWebHook(station.harbor_project_id, {
                    id: clientId,
                    secret: clientSecret
                }, {internalAPIUrl: env.internalApiUrl});
            });

            const specialProjects = [
                HARBOR_MASTER_IMAGE_PROJECT_NAME,
                HARBOR_INCOMING_PROJECT_NAME,
                HARBOR_OUTGOING_PROJECT_NAME
            ];

            specialProjects.map(repository => {
                promises.push(ensureHarborProjectWebHook(repository, {
                    id: clientId,
                    secret: clientSecret
                }, {internalAPIUrl: env.internalApiUrl}, true));

                return repository;
            });

            await Promise.all(promises);
            break;
    }
}
