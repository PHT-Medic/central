import {getRepository} from "typeorm";
import {applyRequestFields} from "typeorm-extension";
import {Station} from "../../../../../domains/pht/station";
import {isRealmPermittedForResource} from "../../../../../domains/auth/realm/db/utils";

export async function getRealmStationRouteHandler(req: any, res: any, type: string) {
    const {id} = req.params;
    const { fields } = req.query;

    let repository;

    try {
        switch (type) {
            case 'related':
                repository = getRepository(Station);

                // todo: for now anyone can see realm - station association

                if(!isRealmPermittedForResource(req.user, {realm_id: id})) {
                    // return res._failForbidden({message: 'You are not allowed to receive station informations.'});
                }

                const query = repository.createQueryBuilder('station')
                    .where({
                        realm_id: id
                    });

                applyRequestFields(query, fields, [
                    'harbor_project_id',
                    'harbor_project_account_name',
                    'harbor_project_account_token',
                    'harbor_project_webhook_exists',
                    'vault_public_key_saved',
                    'public_key'
                ]);

                const entity = await query
                    .getOne();

                if (typeof entity === 'undefined') {
                    return res._failNotFound();
                }

                return res._respond({data: entity});
        }
    } catch (e) {
        return res._failServerError();
    }
}
