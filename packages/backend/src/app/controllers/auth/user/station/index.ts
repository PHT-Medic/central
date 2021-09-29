/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {getCustomRepository, getRepository} from "typeorm";
import {UserRepository} from "../../../../../domains/auth/user/repository";
import {isPermittedForResourceRealm, Station} from "@personalhealthtrain/ui-common";

export async function getUserStationRouteHandler(req: any, res: any) {
    const { id } = req.params;

    const userRepository = getCustomRepository<UserRepository>(UserRepository);
    const user = await userRepository.findOne(id, {relations: ['realm']});

    if(typeof user === 'undefined') {
        return res._failNotFound({message: 'The requested user was not found...'})
    }

    if(!isPermittedForResourceRealm(req.realmId, user.realm_id)) {
        // return res._failForbidden({});
    }

    const stationRepository = getRepository(Station);
    const station = await stationRepository.findOne({
        realm_id: user.realm_id
    });

    if(typeof station === 'undefined') {
        return res._failNotFound({message: 'No station associated with user ' + user.name + '.'});
    }

    return res._respond({data: station});
}
