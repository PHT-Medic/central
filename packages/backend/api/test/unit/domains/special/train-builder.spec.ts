/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getCustomRepository, getRepository } from 'typeorm';
import { UserRepository } from '@typescript-auth/server-core';
import {
    Ecosystem, SecretType, TrainStationApprovalStatus, createNanoID,
} from '@personalhealthtrain/central-common';
import path from 'path';
import { ProposalEntity } from '../../../../src/domains/core/proposal/entity';
import { TEST_DEFAULT_PROPOSAL } from '../../../utils/domains/proposal';
import { TrainEntity } from '../../../../src/domains/core/train/entity';
import { TEST_DEFAULT_TRAIN } from '../../../utils/domains/train';
import { buildTrainBuilderStartCommandPayload } from '../../../../src/domains/special/train-builder/commands';
import { UserSecretEntity } from '../../../../src/domains/core/user-secret/entity';
import { MasterImageEntity } from '../../../../src/domains/core/master-image/entity';
import { TEST_DEFAULT_MASTER_IMAGE } from '../../../utils/domains/master-image';
import { dropTestDatabase, useTestDatabase } from '../../../utils/database/connection';
import { createConfig } from '../../../../src/config';
import env from '../../../../src/env';
import { TrainFileEntity } from '../../../../src/domains/core/train-file/entity';
import { TEST_DEFAULT_TRAIN_FILE } from '../../../utils/domains/train-file';
import { StationEntity } from '../../../../src/domains/core/station/entity';
import { TEST_DEFAULT_STATION } from '../../../utils/domains/station';
import { TrainStationEntity } from '../../../../src/domains/core/train-station/entity';
import { TrainBuilderStation } from '../../../../src/domains/special/train-builder/type';

describe('src/domains/train-builder', () => {
    createConfig({ env });

    beforeAll(async () => {
        await useTestDatabase();
    });

    afterAll(async () => {
        await dropTestDatabase();
    });

    it('should build train message', async () => {
        const userRepository = getCustomRepository(UserRepository);
        const user = await userRepository.findOne({
            name: 'admin',
        });

        const userSecretRepository = getRepository(UserSecretEntity);
        const userRsaSecret = userSecretRepository.create({
            key: SecretType.RSA_PUBLIC_KEY,
            type: SecretType.RSA_PUBLIC_KEY,
            content: 'foo',
            user_id: user.id,
            realm_id: user.realm_id,
        });

        const userPaillierSecret = userSecretRepository.create({
            key: SecretType.PAILLIER_PUBLIC_KEY,
            type: SecretType.PAILLIER_PUBLIC_KEY,
            content: 'bar',
            user_id: user.id,
            realm_id: user.realm_id,
        });

        await userSecretRepository.save(userRsaSecret);
        await userSecretRepository.save(userPaillierSecret);

        // ---------------------------------------------------------

        const masterImageRepository = getRepository(MasterImageEntity);
        const masterImage = await masterImageRepository.create({
            ...TEST_DEFAULT_MASTER_IMAGE,
        });

        await masterImageRepository.save(masterImage);

        const proposalRepository = getRepository(ProposalEntity);
        const proposal = proposalRepository.create({
            ...TEST_DEFAULT_PROPOSAL,
            user_id: user.id,
        });

        await proposalRepository.save(proposal);

        // ---------------------------------------------------------

        const trainRepository = getRepository(TrainEntity);
        const train = trainRepository.create({
            ...TEST_DEFAULT_TRAIN,
            proposal_id: proposal.id,
            user_id: user.id,
            master_image_id: masterImage.id,
        });

        await trainRepository.save(train);

        const trainFileRepository = getRepository(TrainFileEntity);
        const trainFile = trainFileRepository.create({
            ...TEST_DEFAULT_TRAIN_FILE,
            train_id: train.id,
            user_id: user.id,
        });

        await trainFileRepository.save(trainFile);

        train.entrypoint_file_id = trainFile.id;
        train.user_rsa_secret_id = userRsaSecret.id;
        train.user_paillier_secret_id = userPaillierSecret.id;

        await trainRepository.save(train);

        // ---------------------------------------------------------

        const stationRepository = getRepository(StationEntity);
        const stationA = stationRepository.create({
            ...TEST_DEFAULT_STATION,
            name: 'stationA',
            secure_id: createNanoID(),
        });
        const stationB = stationRepository.create({
            ...TEST_DEFAULT_STATION,
            name: 'stationB',
            secure_id: createNanoID(),
        });

        await stationRepository.save(stationA);
        await stationRepository.save(stationB);

        const trainStationRepository = getRepository(TrainStationEntity);
        const trainStationA = trainStationRepository.create({
            train_id: train.id,
            train_realm_id: train.realm_id,
            station_id: stationA.id,
            station_realm_id: stationA.realm_id,
            approval_status: TrainStationApprovalStatus.REJECTED,
        });
        const trainStationB = trainStationRepository.create({
            train_id: train.id,
            train_realm_id: train.realm_id,
            station_id: stationB.id,
            station_realm_id: stationB.realm_id,
            approval_status: TrainStationApprovalStatus.APPROVED,
            position: 0,
        });

        await trainStationRepository.save(trainStationA);
        await trainStationRepository.save(trainStationB);

        // ---------------------------------------------------------

        const trainMessage = await buildTrainBuilderStartCommandPayload(train);

        expect(trainMessage).toBeDefined();
        expect(trainMessage.id).toEqual(train.id);
        expect(trainMessage.user_id).toEqual(user.id);
        expect(trainMessage.user_rsa_secret_id).toEqual(userRsaSecret.id);
        expect(trainMessage.user_paillier_secret_id).toEqual(userPaillierSecret.id);
        expect(trainMessage.proposal_id).toEqual(proposal.id);
        expect(trainMessage.session_id).toBeNull();
        expect(trainMessage.hash).toBeNull();
        expect(trainMessage.hash_signed).toEqual(train.hash_signed);
        expect(trainMessage.query).toEqual(train.query);
        expect(trainMessage.entrypoint_command).toBeNull();
        expect(trainMessage.entrypoint_command_arguments).toEqual([]);
        expect(trainMessage.entrypoint_path).toEqual(path.join(trainFile.directory, trainFile.name));
        expect(trainMessage.master_image).toEqual(masterImage.virtual_path);
        expect(trainMessage.files.length).toEqual(1);
        expect(trainMessage.stations.length).toEqual(1);
        expect(trainMessage.stations).toEqual([{ id: stationB.secure_id, index: 0, ecosystem: Ecosystem.DEFAULT }] as TrainBuilderStation[]);
    });
});
