/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Group, Image } from 'docker-scan';
import { MasterImage, MasterImageGroup } from '@personalhealthtrain/central-common';
import { useDataSource } from 'typeorm-extension';
import { MasterImageEntity } from '../../../../../../domains/core/master-image/entity';
import { MasterImageGroupEntity } from '../../../../../../domains/core/master-image-group/entity';

type ReturnContext<T> = {
    updated: T[],
    created: T[],
    deleted: T[]
};

export async function mergeMasterImagesWithDatabase(
    entities: Image[],
) : Promise<ReturnContext<MasterImage>> {
    if (entities.length === 0) {
        return {
            created: [],
            updated: [],
            deleted: [],
        };
    }

    const dataSource = await useDataSource();

    const virtualPaths : string[] = entities.map((entity) => entity.virtualPath);

    const repository = dataSource.getRepository(MasterImageEntity);
    const dbEntities = await repository.createQueryBuilder()
        .getMany();

    const context : ReturnContext<MasterImage> = {
        created: [],
        updated: [],
        deleted: [],
    };

    context.deleted = dbEntities
        .filter((image) => virtualPaths.indexOf(image.virtual_path) === -1);

    for (let i = 0; i < entities.length; i++) {
        const parts = entities[i].virtualPath.split('/');
        parts.pop();

        const data : Partial<MasterImage> = {
            name: entities[i].name,
            path: entities[i].path,
            group_virtual_path: parts.join('/'),
        };

        if (typeof entities[i].command === 'string') {
            data.command = entities[i].command;
        }

        if (typeof entities[i].command_arguments !== 'undefined') {
            data.command_arguments = entities[i].commandArguments;
        }

        const index = dbEntities.findIndex((dbEntity) => dbEntity.virtual_path === entities[i].virtualPath);
        if (index === -1) {
            context.created.push(repository.create({
                virtual_path: entities[i].virtualPath,
                ...data,
            }));
        } else {
            context.updated.push(repository.merge(dbEntities[index], data));
        }
    }

    if (context.created.length > 0) {
        await repository.insert(context.created);
    }

    if (context.updated.length > 0) {
        await repository.save(context.updated);
    }

    if (context.deleted.length > 0) {
        await repository.delete(context.deleted.map((entry) => entry.id));
    }

    return context;
}

export async function mergeMasterImageGroupsWithDatabase(
    entities: Group[],
) : Promise<ReturnContext<MasterImageGroup>> {
    if (entities.length === 0) {
        return {
            created: [],
            updated: [],
            deleted: [],
        };
    }

    const dataSource = await useDataSource();

    const dirVirtualPaths : string[] = entities.map((entity) => entity.virtualPath);

    const repository = dataSource.getRepository(MasterImageGroupEntity);
    const dbEntities = await repository.createQueryBuilder()
        .getMany();

    const context : ReturnContext<MasterImageGroup> = {
        created: [],
        updated: [],
        deleted: [],
    };

    context.deleted = dbEntities
        .filter((image) => dirVirtualPaths.indexOf(image.virtual_path) === -1);

    for (let i = 0; i < entities.length; i++) {
        const data : Partial<MasterImageGroup> = {
            name: entities[i].name,
            path: entities[i].path,
        };

        if (typeof entities[i].command === 'string') {
            data.command = entities[i].command;
        }

        if (typeof entities[i].command_arguments !== 'undefined') {
            data.command_arguments = entities[i].commandArguments;
        }

        const index = dbEntities.findIndex((dbEntity) => dbEntity.virtual_path === entities[i].virtualPath);
        if (index === -1) {
            context.created.push(repository.create({
                virtual_path: entities[i].virtualPath,
                ...data,
            }));
        } else {
            context.updated.push(repository.merge(dbEntities[index], data));
        }
    }

    if (context.created.length > 0) {
        await repository.insert(context.created);
    }

    if (context.updated.length > 0) {
        await repository.save(context.updated);
    }

    if (context.deleted.length > 0) {
        await repository.delete(context.deleted.map((entry) => entry.id));
    }

    return context;
}
