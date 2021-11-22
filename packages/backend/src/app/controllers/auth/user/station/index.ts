/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {getCustomRepository, getRepository} from "typeorm";
import {UserRepository} from "../../../../../domains/auth/user/repository";
import {isPermittedForResourceRealm, Station} from "@personalhealthtrain/ui-common";
import {ExpressRequest, ExpressResponse} from "../../../../../config/http/type";
import {NotFoundError} from "@typescript-error/http";

export async function getUserStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    const userRepository = getCustomRepository<UserRepository>(UserRepository);
    const user = await userRepository.findOne(id, {relations: ['realm']});

    if(typeof user === 'undefined') {
        throw new NotFoundError();
    }

    if(!isPermittedForResourceRealm(req.realmId, user.realm_id)) {
        // return res._failForbidden({});
    }

    const stationRepository = getRepository(Station);
    const station = await stationRepository.findOne({
        realm_id: user.realm_id
    });

    if(typeof station === 'undefined') {
        throw new NotFoundError();
    }

    return res.respond({data: station});
}
