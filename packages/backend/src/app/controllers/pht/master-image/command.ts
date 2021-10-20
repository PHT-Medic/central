/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {MasterImage, MasterImageCommand, MasterImageGroup} from "@personalhealthtrain/ui-common";
import {getRepository} from "typeorm";

import path from "path";
import {getWritableDirPath} from "../../../../config/paths";
import {syncMasterImageGitRepository} from "../../../../domains/pht/master-image/commands/sync-git-remote-repository";
import {readMasterImageGitLocalRepository} from "../../../../domains/pht/master-image/commands/read-git-local-repository";
import {MasterImageGitGroupEntity, MasterImageGitImageEntity} from "../../../../domains/pht/master-image/commands/type";

export async function handleMasterImageCommandRouteHandler(req: any, res: any) {
    const {id} = req.params;

    if (typeof id !== 'string') {
        return res._failNotFound();
    }

    if(
        !req.body ||
        Object.values(MasterImageCommand).indexOf(req.body.command) === -1
    ) {
        return res._failBadRequest('The master image command is not valid.');
    }

    const command : MasterImageCommand = req.body.command;

    const repository = getRepository(MasterImage);

    const entity = await repository.findOne(id);

    if (typeof entity === 'undefined') {
        return res._failNotFound();
    }

    switch (command) {
        case MasterImageCommand.GIT_REPOSITORY_SYNC:
            const gitURL : string = '';
            const directoryPath : string = path.join(getWritableDirPath(), 'master-images.git');

            await syncMasterImageGitRepository({
                directoryPath,
                gitURL
            });

            const data = await readMasterImageGitLocalRepository(directoryPath);

            // languages
            await handleRepositoryLanguages(data.languages);

            // images
            const images = await handleRepositoryImages(data.images);

            return res._respondAccepted({
                data: images
            });
    }

    return res._failNotFound();
}

async function handleRepositoryImages(entities: MasterImageGitImageEntity[]) : Promise<MasterImage[]> {
    const masterImageRepository = getRepository(MasterImage);

    const paths : string[] = entities.map(entity => entity.path);

    const dbImages = await masterImageRepository.createQueryBuilder('image')
        .where("image.path IN(:...paths)", {paths})
        .getMany();
    const dbImagePaths : string[] = dbImages.map(image => image.path);

    const newEntries : MasterImage[] = [];
    for(let i=0; i<entities.length; i++) {
        const index = dbImagePaths.indexOf(entities[i].path);
        if(index === -1) {
            newEntries.push(masterImageRepository.create({
                name: entities[i].name,
                path: entities[i].path,
                group_id: entities[i].groupId
            }))
        }
    }

    if(newEntries.length > 0) {
        await masterImageRepository.save(newEntries);
    }

    return newEntries;
}

async function handleRepositoryLanguages(entities: MasterImageGitGroupEntity[]) {
    const repository = getRepository(MasterImageGroup);

    const ids : string[] = entities.map(entity => entity.id);

    const dbLanguages = await repository.createQueryBuilder('group')
        .where("group.id IN(:...ids)", {ids})
        .getMany();

    const dBLanguageIds : string[] = dbLanguages.map(language => language.id);

    const newEntries : MasterImageGroup[] = [];

    for(let i=0; i<entities.length; i++) {
        const index = dBLanguageIds.indexOf(entities[i].id);
        if(index === -1) {
            newEntries.push(repository.create({
                id: entities[i].id,
                name: entities[i].name,
                version: entities[i].name,
                ...(entities[i].license ? {license: entities[i].license} : {}),
                ...(entities[i].description ? {description: entities[i].description} : {})
            }));
        }
    }

    if(newEntries.length > 0) {
        await repository.save(newEntries);
    }
}
