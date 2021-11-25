/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getRepository } from 'typeorm';
import {
    MasterImage, MasterImageGroup, Train, TrainFile, TrainStation, TrainStationApprovalStatus, UserKeyRing,
} from '@personalhealthtrain/ui-common';

export async function buildTrainBuilderStartCommandPayload(train: Train) {
    const message : Record<string, any> = {
        userId: train.user_id,
        trainId: train.id,
        buildId: train.build_id,
        proposalId: train.proposal_id,
        sessionId: train.session_id,
        hash: train.hash,
        hashSigned: train.hash_signed,
        query: train.query,
    };

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

    if (masterImage.command) {
        message.entrypointCommand = masterImage.command;
    } else {

    }

    message.entrypointCommand = masterImage.command
        ? masterImage.command
        : masterImageGroup.command;

    message.entrypointCommandArguments = masterImage.command_arguments
        ? masterImage.command_arguments
        : masterImageGroup.command_arguments;

    // ----------------------------------------------------

    const keyRingRepository = getRepository(UserKeyRing);
    const keyRing = await keyRingRepository.findOne({
        user_id: train.user_id,
    });
    if (typeof keyRing === 'undefined') {
        throw new Error();
    }

    message.user_he_key = keyRing ? keyRing.he_key : null;

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
