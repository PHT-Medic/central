/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {MasterImageGroupType} from "@personalhealthtrain/ui-common";

export enum MasterImageGitDirectory {
    LANGUAGE = 'language',
    CUSTOM = 'custom'
}

export type MasterImageGitGroupEntity = {
    id: string,
    type: MasterImageGroupType,
    name: string,
    version?: string,
    license?: string,
    description?: string
}

export type MasterImageGitImageEntity = {
    path: string,
    name: string,
    group: MasterImageGroupType,
    groupId?: string
};

export type MasterImagesGitReturnContext = {
    languages: MasterImageGitGroupEntity[],
    images: MasterImageGitImageEntity[]
}

export type LocalImageRepositoryImageSearch = {
    path: string,
    group: MasterImageGroupType,
    groupId?: string
}

export type MaterImagesGitSyncContext = {
    directoryPath: string,
    gitURL: string
}
