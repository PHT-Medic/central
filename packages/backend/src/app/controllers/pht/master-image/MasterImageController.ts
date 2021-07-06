import {getRepository} from "typeorm";
import {applyRequestFilter} from "typeorm-extension";
import {MasterImage} from "../../../../domains/pht/master-image";

import {Controller, Get, Params, Request, Response} from "@decorators/express";
import {ResponseExample, SwaggerTags} from "typescript-swagger";
import {ForceLoggedInMiddleware} from "../../../../config/http/middleware/auth";

type PartialMasterImage = Partial<MasterImage>;

@SwaggerTags('pht')
@Controller("/master-images")
export class MasterImageController {
    @Get("",[ForceLoggedInMiddleware])
    @ResponseExample<PartialMasterImage[]>([
        {name: 'slim', external_tag_id: 'slim', id: 1, proposals: [], trains: []},
        {name: 'buster', external_tag_id: 'buster', id: 1, proposals: [], trains: []}
    ])
    async getMany(
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialMasterImage[]> {
        return await getMasterImagesRouteHandler(req, res) as PartialMasterImage[];
    }

    @Get("/:id",[ForceLoggedInMiddleware])
    @ResponseExample<PartialMasterImage>({name: 'slim', external_tag_id: 'slim', id: 1, proposals: [], trains: []})
    async getOne(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialMasterImage|undefined> {
        return await getMasterImageRouteHandler(req, res) as PartialMasterImage | undefined;
    }
}

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
    const { filter } = req.query;

    const repository = getRepository(MasterImage);
    const query = repository.createQueryBuilder('image');

    applyRequestFilter(query, filter, {
        id: 'image.id',
        name: 'image.name'
    });

    const entity = await query.getMany();

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    return res._respond({data: entity})
}
