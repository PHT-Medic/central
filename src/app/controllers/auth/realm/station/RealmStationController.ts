import {getRepository} from "typeorm";
import {isPermittedToOperateOnRealmResource} from "../../../../../modules/auth/utils";
import {Station} from "../../../../../domains/pht/station";
import {applyRequestFields} from "../../../../../db/utils/select";

export async function getRealmStationRouteHandler(req: any, res: any, type: string) {
    let {id} = req.params;
    let { fields } = req.query;

    let repository;

    try {
        switch (type) {
            case 'related':
                repository = getRepository(Station);

                if(!isPermittedToOperateOnRealmResource(req.user, {realm_id: id})) {
                    return res._failForbidden();
                }

                let query = repository.createQueryBuilder('station')
                    .where({
                        realm_id: id
                    });

                applyRequestFields(query, 'station', fields, [
                    'harbor_project_id',
                    'harbor_project_account_name',
                    'harbor_project_account_token',
                    'harbor_project_webhook_exists',
                    'vault_public_key_saved',
                    'public_key'
                ]);

                let entity = await query
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
