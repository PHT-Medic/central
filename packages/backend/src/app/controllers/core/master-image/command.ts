/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MasterImage, MasterImageCommand, MasterImageGroup } from '@personalhealthtrain/ui-common';
import { getRepository } from 'typeorm';

import path from 'path';
import fs from 'fs';
import { clone, pull } from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import { Group, Image, scanDirectory } from 'fs-docker';
import { BadRequestError, NotFoundError } from '@typescript-error/http';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';
import { getWritableDirPath } from '../../../../config/paths';

export async function handleMasterImageCommandRouteHandler(req: ExpressRequest, res: ExpressResponse) {
    if (
        !req.body
        || Object.values(MasterImageCommand).indexOf(req.body.command) === -1
    ) {
        throw new BadRequestError('The master image command is not valid.');
    }

    const { command } = req.body;

    switch (command) {
        case MasterImageCommand.GIT_REPOSITORY_SYNC:
            const gitURL = 'https://github.com/PHT-Medic/master-images';
            const directoryPath : string = path.join(getWritableDirPath(), 'master-images.git');

            try {
                await fs.promises.access(directoryPath, fs.constants.F_OK | fs.constants.R_OK);
                await pull({
                    fs,
                    http,
                    dir: directoryPath,
                    ref: 'master',
                    author: {
                        name: 'ui',
                    },
                });
            } catch (e) {
                await clone({
                    fs,
                    http,
                    url: gitURL,
                    dir: directoryPath,
                    ref: 'master',
                });
            }

            const data = await scanDirectory(directoryPath);

            // languages
            const groups = await mergeDirectoryGroupsWithDatabase(data.groups);

            // images
            const images = await mergeRepositoryImagesWithDatabase(data.images);

            return res.respondAccepted({
                data: {
                    groups,
                    images,
                },
            });
    }

    throw new NotFoundError();
}

type ReturnContext<T> = {
    updated: T[],
    created: T[],
    deleted: T[]
};

async function mergeRepositoryImagesWithDatabase(
    entities: Image[],
) : Promise<ReturnContext<MasterImage>> {
    if (entities.length === 0) {
        return {
            created: [],
            updated: [],
            deleted: [],
        };
    }

    const virtualPaths : string[] = entities.map((entity) => entity.virtualPath);

    const repository = getRepository(MasterImage);
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

async function mergeDirectoryGroupsWithDatabase(entities: Group[]) : Promise<ReturnContext<MasterImageGroup>> {
    if (entities.length === 0) {
        return {
            created: [],
            updated: [],
            deleted: [],
        };
    }

    const dirVirtualPaths : string[] = entities.map((entity) => entity.virtualPath);

    const repository = getRepository(MasterImageGroup);
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
