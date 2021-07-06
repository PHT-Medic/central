import {Connection, getRepository} from "typeorm";
import {Factory, Seeder} from "typeorm-seeding";
import {BaseService, Service} from "../../domains/service";
import {Client} from "../../domains/auth/client";

export default class ServiceSeeder implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
        const serviceRepository = connection.getRepository(Service);

        const rawServices : Record<string,any>[] = [
            {id: BaseService.HARBOR},
            {id: BaseService.TRAIN_BUILDER},
            {id: BaseService.TRAIN_ROUTER},
            {id: BaseService.RESULT_SERVICE}
        ];

        const services : Service[] = [];

        for(let i=0; i<rawServices.length; i++) {
            const service = serviceRepository.create(rawServices[i]);
            services.push(service)
        }

        await serviceRepository.save(services);

        const clientRepository = getRepository(Client);
        const clients = services.map(service => {
            return clientRepository.create({
                name: service.id,
                 service
            });
        });

        await clientRepository.save(clients);
    }
}
