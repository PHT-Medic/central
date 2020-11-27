import {getRepository} from "typeorm";
import {applyRequestFilterOnQuery} from "../../../db/utils";
import {MasterImage} from "../../../domains/pht/master-image";

export async function getMasterImageRouteHandler(req: any, res: any) {
    const { id } = req.params;

    const repository = getRepository(MasterImage);

    const entity = await repository.findOne(id);

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    return res._respond({data: entity})
}

export async function getMasterImagesRouteHandler(req: any, res: any) {
    let { filter } = req.query;

    const repository = getRepository(MasterImage);
    const query = repository.createQueryBuilder('image');

    applyRequestFilterOnQuery(query, filter, {
        id: 'image.id',
        name: 'image.name'
    });

    const entity = await query.getMany();

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    return res._respond({data: entity})
}
