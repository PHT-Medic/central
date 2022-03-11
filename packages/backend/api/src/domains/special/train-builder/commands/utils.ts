/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Ecosystem, Train, TrainStationApprovalStatus } from '@personalhealthtrain/central-common';
import { getRepository } from 'typeorm';
import { TrainStationEntity } from '../../../core/train-station/entity';
import { TrainBuilderStation } from '../type';

export async function buildTrainBuilderStationsProperty(id: Train['id']) : Promise<TrainBuilderStation[]> {
    const trainStationRepository = getRepository(TrainStationEntity);
    const trainStations = await trainStationRepository
        .createQueryBuilder('trainStation')
        .leftJoinAndSelect('trainStation.station', 'station')
        .addSelect('station.secure_id')
        .where('trainStation.train_id = :trainId', { trainId: id })
        .andWhere('trainStation.approval_status = :status', { status: TrainStationApprovalStatus.APPROVED })
        .getMany();

    return trainStations.map((trainStation) => ({
        id: trainStation.station.secure_id,
        ecosystem: trainStation.station.ecosystem as Ecosystem,
        index: trainStation.position,
    }));
}
