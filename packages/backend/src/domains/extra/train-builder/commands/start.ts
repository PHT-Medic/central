/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getRepository } from 'typeorm';

import {
    MasterImage,
    MasterImageGroup,
    SecretType,
    Train,
    TrainFile,
    TrainStation,
    TrainStationApprovalStatus,
    UserSecret,
} from '@personalhealthtrain/ui-common';
import { TrainBuilderStartPayload } from '../type';

export async function buildTrainBuilderStartCommandPayload(train: Train) : Promise<Partial<TrainBuilderStartPayload>> {
    const message : Partial<TrainBuilderStartPayload> = {
        userId: train.user_id,
        trainId: train.id,
        buildId: train.build_id,
        proposalId: train.proposal_id,
        sessionId: train.session_id,
        hash: train.hash,
        hashSigned: train.hash_signed,
        query: train.query,
    };

    // ----------------------------------------------------

    const userSecretRepository = getRepository(UserSecret);
    const userSecret = await userSecretRepository.findOne({
        user_id: train.user_id,
        type: SecretType.PAILLIER_PUBLIC_KEY,
    });

    message.user_he_key = userSecret ? userSecret.content : null;

    // ----------------------------------------------------

    const masterImageRepository = getRepository(MasterImage);
    const masterImage = await masterImageRepository.findOne(train.master_image_id);
    if (typeof masterImage === 'undefined') {
        throw new Error();
    }

    message.masterImage = masterImage.virtual_path;

    const masterImageGroupRepository = getRepository(MasterImageGroup);
    const masterImageGroup = await masterImageGroupRepository.findOne({
        virtual_path: masterImage.group_virtual_path,
    });
    if (typeof masterImageGroup === 'undefined') {
        throw new Error();
    }

    message.entrypointCommand = masterImage.command
        ? masterImage.command
        : masterImageGroup.command;

    message.entrypointCommandArguments = masterImage.command_arguments
        ? masterImage.command_arguments
        : masterImageGroup.command_arguments;

    // ----------------------------------------------------

    const filesRepository = getRepository(TrainFile);
    const files: TrainFile[] = await filesRepository
        .createQueryBuilder('file')
        .where('file.train_id = :id', { id: train.id })
        .getMany();
    message.files = files.map((file: TrainFile) => `${file.directory}/${file.name}`);

    // ----------------------------------------------------

    const entryPointFile = await filesRepository.findOne(train.entrypoint_file_id);
    if (typeof entryPointFile === 'undefined') {
        throw new Error();
    }

    message.entrypointPath = `${entryPointFile.directory}/${entryPointFile.name}`;

    // ----------------------------------------------------

    const trainStationRepository = getRepository(TrainStation);
    const trainStations = await trainStationRepository
        .createQueryBuilder('trainStation')
        .leftJoinAndSelect('trainStation.station', 'station')
        .addSelect('station.secure_id')
        .where('trainStation.train_id = :trainId', { trainId: train.id })
        .andWhere('trainStation.approval_status = :status', { status: TrainStationApprovalStatus.APPROVED })
        .getMany();

    message.stations = trainStations.map((trainStation) => trainStation.station.secure_id);

    return message;
}
