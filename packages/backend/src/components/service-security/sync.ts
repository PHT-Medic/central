/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {Message} from "amqp-extension";
import {
    StaticService, REGISTRY_INCOMING_PROJECT_NAME,
    REGISTRY_MASTER_IMAGE_PROJECT_NAME, REGISTRY_OUTGOING_PROJECT_NAME, HarborProjectWebhook,
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
        case StaticService.RESULT_SERVICE:
        case StaticService.TRAIN_BUILDER:
        case StaticService.TRAIN_ROUTER:
            await saveServiceSecretToVault(serviceId, {id: clientId, secret: clientSecret});
            break;
        case StaticService.REGISTRY:
            const stationRepository = getRepository(Station);
            const stations = await stationRepository.find({
                registry_project_id: Not(IsNull())
            });

            const promises : Promise<HarborProjectWebhook>[] = stations.map((station: Station) => {
                return ensureHarborProjectWebHook(station.registry_project_id, {
                    id: clientId,
                    secret: clientSecret
                }, {internalAPIUrl: env.internalApiUrl});
            });

            const specialProjects = [
                REGISTRY_MASTER_IMAGE_PROJECT_NAME,
                REGISTRY_INCOMING_PROJECT_NAME,
                REGISTRY_OUTGOING_PROJECT_NAME
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
