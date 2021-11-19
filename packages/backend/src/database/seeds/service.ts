/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {SERVICE_ID, Client} from "@personalhealthtrain/ui-common";
import {Connection, getRepository} from "typeorm";
import {Factory, Seeder} from "typeorm-seeding";

export default class ServiceSeeder implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {

        const services : SERVICE_ID[] = Object.values(SERVICE_ID);

        const clientRepository = getRepository(Client);
        const clients = services.map(service => {
            return clientRepository.create({
                name: service,
                service_id: service
            });
        });

        await clientRepository.save(clients);
    }
}
