import {getCustomRepository, getRepository} from "typeorm";
import {UserRepository} from "../../../../domains/user/repository";
import {Station} from "../../../../domains/pht/station";
import {isRealmPermittedForResource} from "../../../../modules/auth/utils";

export async function getUserStationRouteHandler(req: any, res: any) {
    let { id } = req.params;

    const userRepository = getCustomRepository<UserRepository>(UserRepository);
    const user = await userRepository.findOne(id, {relations: ['realm']});

    if(!isRealmPermittedForResource(req.user, user)) {
        return res._failForbidden();
    }

    const stationRepository = getRepository(Station);
    const station = stationRepository.findOne({
        realm_id: user.realm_id
    });

    if(typeof station === 'undefined') {
        return res._failNotFound();
    }

    return res._respond({data: station});
}
