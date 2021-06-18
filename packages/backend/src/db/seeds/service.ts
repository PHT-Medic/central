import {Factory, Seeder} from "typeorm-seeding";
import {Connection} from "typeorm";
import {BaseService, Service} from "../../domains/service";

export default class ServiceSeeder implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
        const serviceRepository = connection.getRepository(Service);

        const services : Partial<Service>[] = serviceRepository.create([
            {id: BaseService.HARBOR},
            {id: BaseService.TRAIN_BUILDER},
            {id: BaseService.TRAIN_ROUTER},
            {id: BaseService.RESULT_SERVICE}
        ]);

        for(let i=0; i<services.length; i++) {
            services[i].createClient();
        }

        await serviceRepository.insert(services);

        // todo: push client id & secret to vault for (Train Router + Train Builder)
        // todo: refresh harbor webhooks with new secret.
    }
}
