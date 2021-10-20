/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from "path";
import fs from "fs";

import {
    LocalImageRepositoryImageSearch,
    MasterImageGitDirectory,
    MasterImageGitGroupEntity,
    MasterImageGitImageEntity,
    MasterImagesGitReturnContext
} from "./type";

import {MasterImageGroupType} from "@personalhealthtrain/ui-common";

export async function readMasterImageGitLocalRepository(dirPath: string) : Promise<MasterImagesGitReturnContext> {
    const response : MasterImagesGitReturnContext = {
        languages: [],
        images: []
    };

    const entries = await fs.promises.opendir(dirPath, {encoding: 'utf-8'});
    for await (const dirent of entries) {
        if(!dirent.isDirectory()) {
            continue;
        }

        if(dirent.name === MasterImageGitDirectory.LANGUAGE) {
            response.languages = await findLocalRepositoryLanguages(path.join(dirPath, dirent.name));
        }

        if(
            dirent.name === MasterImageGitDirectory.LANGUAGE ||
            dirent.name === MasterImageGitDirectory.CUSTOM
        ) {
            const initialGroup : MasterImageGroupType = dirent.name === MasterImageGitDirectory.CUSTOM ?
                MasterImageGroupType.DEFAULT :
                MasterImageGroupType.LANGUAGE;

            const images = await findLocalRepositoryImages(path.join(dirPath, dirent.name), {
                path: '',
                group: initialGroup
            });

            response.images.push(...images);
        }
    }

    return response;
}

async function findLocalRepositoryLanguages(dirPath: string) : Promise<MasterImageGitGroupEntity[]> {
    const languages : MasterImageGitGroupEntity[] = [];

    const entries = await fs.promises.opendir(dirPath, {encoding: 'utf-8'});
    for await (const dirent of entries) {
        if(!dirent.isDirectory()) {
            continue;
        }

        const content : MasterImageGitGroupEntity | undefined = await findMasterImageGroupFile(path.join(dirPath, dirent.name));

        if(content.type !== MasterImageGroupType.LANGUAGE) {
            continue;
        }

        const index = languages.findIndex(language => language.id === content.id);
        if(index === -1) {
            languages.push(content);
        }
    }

    return languages;
}

async function findMasterImageGroupFile(baseDir: string) : Promise<MasterImageGitGroupEntity|undefined> {
    const metaFilePath : string = path.join(baseDir, 'master-image-group.json');

    try {
        await fs.promises.access(metaFilePath);
    } catch (e) {
        return undefined;
    }

    const rawContent = await fs.promises.readFile(metaFilePath);
    return JSON.parse(rawContent.toString('utf-8'));
}

async function findLocalRepositoryImages(dirPath: string, options: LocalImageRepositoryImageSearch) : Promise<MasterImageGitImageEntity[]> {
    const images : MasterImageGitImageEntity[] = [];

    const metaFile = await findMasterImageGroupFile(dirPath);

    const entries = await fs.promises.opendir(dirPath, {encoding: 'utf-8'});
    for await (const dirent of entries) {
        if(dirent.isDirectory()) {
            images.push(...await findLocalRepositoryImages(path.join(dirPath, dirent.name), {
                ...options,
                path: path.join(options.path, dirent.name),
                groupId: metaFile && metaFile.type !== MasterImageGroupType.LANGUAGE ? metaFile.id: options.groupId
            }));
        }

        if(
            dirent.isFile() &&
            dirent.name.toLowerCase() === 'dockerfile'
        ) {
            images.push({
                name: dirent.name,
                group: options.group,
                groupId: metaFile && metaFile.type !== MasterImageGroupType.LANGUAGE ?
                    metaFile.id :
                    options.groupId,
                path: options.path
            })
        }
    }

    return images;
}
