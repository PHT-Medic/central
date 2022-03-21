/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getRepository } from 'typeorm';

import {
    Train,
    TrainBuilderStartPayload,
} from '@personalhealthtrain/central-common';
import path from 'path';
import { MasterImageEntity } from '../../../core/master-image/entity';
import { MasterImageGroupEntity } from '../../../core/master-image-group/entity';
import { TrainFileEntity } from '../../../core/train-file/entity';
import { buildTrainBuilderStationsProperty } from './utils';

export async function buildTrainBuilderStartCommandPayload(train: Train) : Promise<Partial<TrainBuilderStartPayload>> {
    const message : Partial<TrainBuilderStartPayload> = {
        id: train.id,

        user_id: train.user_id,

        user_rsa_secret_id: train.user_rsa_secret_id,
        user_paillier_secret_id: train.user_paillier_secret_id,

        proposal_id: train.proposal_id,
        session_id: train.session_id,
        hash: train.hash,
        hash_signed: train.hash_signed,
        query: train.query,

        entrypoint_command: null,
        entrypoint_command_arguments: [],
        entrypoint_path: null,
    };

    // ----------------------------------------------------

    const masterImageRepository = getRepository(MasterImageEntity);
    const masterImage = await masterImageRepository.findOne(train.master_image_id);
    if (typeof masterImage === 'undefined') {
        throw new Error();
    }

    message.master_image = masterImage.virtual_path;
    message.entrypoint_command = message.entrypoint_command || masterImage.command;
    message.entrypoint_command_arguments = message.entrypoint_command_arguments || masterImage.command_arguments;

    const masterImageGroupRepository = getRepository(MasterImageGroupEntity);
    const masterImageGroup = await masterImageGroupRepository.findOne({
        virtual_path: masterImage.group_virtual_path,
    });
    if (typeof masterImageGroup !== 'undefined') {
        message.entrypoint_command = message.entrypoint_command || masterImageGroup.command;
        message.entrypoint_command_arguments = message.entrypoint_command_arguments || masterImageGroup.command_arguments;
    }

    // ----------------------------------------------------

    const filesRepository = getRepository(TrainFileEntity);
    const files: TrainFileEntity[] = await filesRepository
        .createQueryBuilder('file')
        .where('file.train_id = :id', { id: train.id })
        .getMany();

    message.files = files.map((file: TrainFileEntity) => `${file.directory}/${file.name}`);

    // ----------------------------------------------------

    const entryPointFile = await filesRepository.findOne(train.entrypoint_file_id);
    if (typeof entryPointFile === 'undefined') {
        throw new Error();
    }

    message.entrypoint_path = path.join(entryPointFile.directory, entryPointFile.name);

    // ----------------------------------------------------

    message.stations = await buildTrainBuilderStationsProperty(train.id);

    return message;
}
